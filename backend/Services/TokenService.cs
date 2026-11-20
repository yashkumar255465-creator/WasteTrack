using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.IdentityModel.Tokens;

namespace WasteTrack.API.Services;

public interface ITokenService
{
    (string token, DateTime expiresOn) CreateAccessToken(int accountId, string name, string role, int? zoneId);
    string CreateRefreshToken();
}

public class TokenService : ITokenService
{
    private readonly IConfiguration _config;

    public TokenService(IConfiguration config)
    {
        _config = config;
    }

    public (string token, DateTime expiresOn) CreateAccessToken(int accountId, string name, string role, int? zoneId)
    {
        var jwtSection = _config.GetSection("Jwt");
        var key = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(jwtSection["Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.Name, name),
            new(ClaimTypes.Role, role),
            new("account_id", accountId.ToString())
        };
        if (zoneId.HasValue)
            claims.Add(new Claim("zone_id", zoneId.Value.ToString()));

        var minutes = double.Parse(jwtSection["AccessTokenMinutes"] ?? "60");
        var expires = DateTime.UtcNow.AddMinutes(minutes);

        var token = new JwtSecurityToken(
            issuer: jwtSection["Issuer"],
            audience: jwtSection["Audience"],
            claims: claims,
            expires: expires,
            signingCredentials: creds);

        return (new JwtSecurityTokenHandler().WriteToken(token), expires);
    }

    public string CreateRefreshToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(bytes);
    }
}
