using Microsoft.EntityFrameworkCore;
using WasteTrack.API.Data;
using WasteTrack.API.Helpers;
using WasteTrack.API.Models.DTOs;
using WasteTrack.API.Models.Entities;

namespace WasteTrack.API.Services;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request);
    Task<LoginResponse?> RefreshAsync(string refreshToken);
    Task RevokeAsync(string refreshToken);
}

// Login checks super_admin first, then admin_info, then user_info — the three
// role tables are physically separate in this schema, so authentication has
// to probe each one rather than a single "users" table.
public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _db;
    private readonly ITokenService _tokens;
    private readonly IConfiguration _config;

    public AuthService(ApplicationDbContext db, ITokenService tokens, IConfiguration config)
    {
        _db = db;
        _tokens = tokens;
        _config = config;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        var superAdmin = await _db.SuperAdmins
            .FirstOrDefaultAsync(x => x.Uname == request.Uname && x.Status);
        if (superAdmin != null && BCrypt.Net.BCrypt.Verify(request.Password, superAdmin.Pwd))
            return await IssueTokensAsync(superAdmin.Id, superAdmin.Name, Roles.SuperAdmin, null);

        var admin = await _db.AdminInfos.Include(a => a.Zone)
            .FirstOrDefaultAsync(x => x.Uname == request.Uname && x.Status);
        if (admin != null && BCrypt.Net.BCrypt.Verify(request.Password, admin.Pwd))
            return await IssueTokensAsync(admin.Id, admin.Name, Roles.Admin, admin.ZoneId, admin.Zone?.ZoneName);

        var user = await _db.UserInfos.Include(u => u.Zone)
            .FirstOrDefaultAsync(x => x.Uname == request.Uname && x.Status);
        if (user != null && BCrypt.Net.BCrypt.Verify(request.Password, user.Pwd))
            return await IssueTokensAsync(user.Id, user.Name, Roles.User, user.ZoneId, user.Zone?.ZoneName);

        return null;
    }

    public async Task<LoginResponse?> RefreshAsync(string refreshToken)
    {
        var stored = await _db.RefreshTokens.FirstOrDefaultAsync(t => t.Token == refreshToken);
        if (stored == null || stored.Revoked || stored.ExpiresOn < DateTime.UtcNow)
            return null;

        stored.Revoked = true;

        // Re-issue based on the role recorded with the original token.
        var role = stored.Role.ToString();
        switch (stored.Role)
        {
            case AppRole.SuperAdmin:
                var sa = await _db.SuperAdmins.FirstOrDefaultAsync(x => x.Uname == stored.AccountUname);
                if (sa == null) return null;
                return await IssueTokensAsync(sa.Id, sa.Name, Roles.SuperAdmin, null);
            case AppRole.Admin:
                var ad = await _db.AdminInfos.Include(a => a.Zone).FirstOrDefaultAsync(x => x.Uname == stored.AccountUname);
                if (ad == null) return null;
                return await IssueTokensAsync(ad.Id, ad.Name, Roles.Admin, ad.ZoneId, ad.Zone?.ZoneName);
            case AppRole.User:
                var us = await _db.UserInfos.Include(u => u.Zone).FirstOrDefaultAsync(x => x.Uname == stored.AccountUname);
                if (us == null) return null;
                return await IssueTokensAsync(us.Id, us.Name, Roles.User, us.ZoneId, us.Zone?.ZoneName);
            default:
                return null;
        }
    }

    public async Task RevokeAsync(string refreshToken)
    {
        var stored = await _db.RefreshTokens.FirstOrDefaultAsync(t => t.Token == refreshToken);
        if (stored != null)
        {
            stored.Revoked = true;
            await _db.SaveChangesAsync();
        }
    }

    private async Task<LoginResponse> IssueTokensAsync(int accountId, string name, string role, int? zoneId, string? zoneName = null)
    {
        var (access, expires) = _tokens.CreateAccessToken(accountId, name, role, zoneId);
        var refresh = _tokens.CreateRefreshToken();

        var uname = role switch
        {
            Roles.SuperAdmin => (await _db.SuperAdmins.FindAsync(accountId))?.Uname,
            Roles.Admin => (await _db.AdminInfos.FindAsync(accountId))?.Uname,
            _ => (await _db.UserInfos.FindAsync(accountId))?.Uname
        } ?? string.Empty;

        var appRole = role switch
        {
            Roles.SuperAdmin => AppRole.SuperAdmin,
            Roles.Admin => AppRole.Admin,
            _ => AppRole.User
        };

        var days = double.Parse(_config["Jwt:RefreshTokenDays"] ?? "7");
        _db.RefreshTokens.Add(new RefreshToken
        {
            Token = refresh,
            AccountUname = uname,
            Role = appRole,
            ExpiresOn = DateTime.UtcNow.AddDays(days)
        });
        await _db.SaveChangesAsync();

        return new LoginResponse
        {
            AccessToken = access,
            RefreshToken = refresh,
            ExpiresOn = expires,
            Role = role,
            AccountId = accountId,
            Name = name,
            ZoneId = zoneId,
            ZoneName = zoneName
        };
    }
}
