using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WasteTrack.API.Data;
using WasteTrack.API.Helpers;
using WasteTrack.API.Models.DTOs;
using WasteTrack.API.Models.Entities;

namespace WasteTrack.API.Controllers;

// User Management is Super Admin-only per spec (Admin/User sidebars never
// include it).
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = Roles.SuperAdmin)]
public class UserManagementController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public UserManagementController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<UserListItemDto>>> GetAll()
    {
        var admins = await _db.AdminInfos.Include(a => a.Zone).AsNoTracking()
            .Select(a => new UserListItemDto
            {
                Id = a.Id, Name = a.Name, Uname = a.Uname, Role = Roles.Admin,
                ZoneId = a.ZoneId, ZoneName = a.Zone!.ZoneName, Status = a.Status, AddedOn = a.AddedOn
            }).ToListAsync();

        var users = await _db.UserInfos.Include(u => u.Zone).AsNoTracking()
            .Select(u => new UserListItemDto
            {
                Id = u.Id, Name = u.Name, Uname = u.Uname, Role = Roles.User,
                ZoneId = u.ZoneId, ZoneName = u.Zone!.ZoneName, Status = u.Status, AddedOn = u.AddedOn
            }).ToListAsync();

        var superAdmins = await _db.SuperAdmins.AsNoTracking()
            .Select(s => new UserListItemDto
            {
                Id = s.Id, Name = s.Name, Uname = s.Uname, Role = Roles.SuperAdmin,
                ZoneId = null, ZoneName = null, Status = s.Status, AddedOn = s.CreatedOn
            }).ToListAsync();

        return Ok(superAdmins.Concat(admins).Concat(users).OrderBy(x => x.Name).ToList());
    }

    [HttpPost]
    public async Task<ActionResult> Create(CreateUserRequest request)
    {
        var hash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        if (request.Role == Roles.Admin)
        {
            if (request.ZoneId == null) return BadRequest(new { message = "ZoneId is required for Admin role." });
            var entity = new AdminInfo
            {
                Name = request.Name, Designation = request.Designation, Department = request.Department,
                Uname = request.Uname, Pwd = hash, RoleId = (int)AppRole.Admin, ZoneId = request.ZoneId.Value,
                Status = true, AddedBy = User.AccountId(), AddedOn = DateTime.UtcNow
            };
            _db.AdminInfos.Add(entity);
        }
        else if (request.Role == Roles.User)
        {
            if (request.ZoneId == null) return BadRequest(new { message = "ZoneId is required for User role." });
            var entity = new UserInfo
            {
                Name = request.Name, Designation = request.Designation, Department = request.Department,
                Uname = request.Uname, Pwd = hash, RoleId = (int)AppRole.User, ZoneId = request.ZoneId.Value,
                Status = true, AddedBy = User.AccountId(), AddedOn = DateTime.UtcNow
            };
            _db.UserInfos.Add(entity);
        }
        else if (request.Role == Roles.SuperAdmin)
        {
            var entity = new SuperAdmin
            {
                Name = request.Name, Uname = request.Uname, Pwd = hash, RoleId = (int)AppRole.SuperAdmin, Status = true
            };
            _db.SuperAdmins.Add(entity);
        }
        else
        {
            return BadRequest(new { message = "Role must be SuperAdmin, Admin or User." });
        }

        await _db.SaveChangesAsync();
        return StatusCode(201);
    }

    [HttpPut("{role}/{id:int}")]
    public async Task<ActionResult> Update(string role, int id, UpdateUserRequest request)
    {
        if (role == Roles.Admin)
        {
            var entity = await _db.AdminInfos.FindAsync(id);
            if (entity == null) return NotFound();
            if (request.Name != null) entity.Name = request.Name;
            if (request.Designation != null) entity.Designation = request.Designation;
            if (request.Department != null) entity.Department = request.Department;
            if (request.ZoneId.HasValue) entity.ZoneId = request.ZoneId.Value;
            if (request.Status.HasValue) entity.Status = request.Status.Value;
            if (!string.IsNullOrWhiteSpace(request.NewPassword)) entity.Pwd = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        }
        else if (role == Roles.User)
        {
            var entity = await _db.UserInfos.FindAsync(id);
            if (entity == null) return NotFound();
            if (request.Name != null) entity.Name = request.Name;
            if (request.Designation != null) entity.Designation = request.Designation;
            if (request.Department != null) entity.Department = request.Department;
            if (request.ZoneId.HasValue) entity.ZoneId = request.ZoneId.Value;
            if (request.Status.HasValue) entity.Status = request.Status.Value;
            if (!string.IsNullOrWhiteSpace(request.NewPassword)) entity.Pwd = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        }
        else if (role == Roles.SuperAdmin)
        {
            var entity = await _db.SuperAdmins.FindAsync(id);
            if (entity == null) return NotFound();
            if (request.Name != null) entity.Name = request.Name;
            if (request.Status.HasValue) entity.Status = request.Status.Value;
            if (!string.IsNullOrWhiteSpace(request.NewPassword)) entity.Pwd = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        }
        else
        {
            return BadRequest(new { message = "Unknown role." });
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // Soft-delete (deactivate) rather than hard delete, so historical trips
    // (user_id / added_by references) stay valid.
    [HttpDelete("{role}/{id:int}")]
    public async Task<ActionResult> Deactivate(string role, int id)
    {
        switch (role)
        {
            case Roles.Admin:
                var admin = await _db.AdminInfos.FindAsync(id);
                if (admin == null) return NotFound();
                admin.Status = false;
                break;
            case Roles.User:
                var user = await _db.UserInfos.FindAsync(id);
                if (user == null) return NotFound();
                user.Status = false;
                break;
            case Roles.SuperAdmin:
                var sa = await _db.SuperAdmins.FindAsync(id);
                if (sa == null) return NotFound();
                sa.Status = false;
                break;
            default:
                return BadRequest(new { message = "Unknown role." });
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }
}
