using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WasteTrack.API.Data;
using WasteTrack.API.Helpers;
using WasteTrack.API.Models.DTOs;
using WasteTrack.API.Models.Entities;

namespace WasteTrack.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = Roles.SuperAdmin)]
public class ZoneManagementController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public ZoneManagementController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<ZoneDto>>> GetAll()
    {
        var requiredZones = new[] { "peelamedu", "sathy_road", "ukkadam", "compost_plant" };
        var zones = await _db.Zones.AsNoTracking()
            .Where(z => requiredZones.Contains(z.ZoneName.ToLower()))
            .ToListAsync();
        var userCounts = await _db.UserInfos.Where(u => u.Status).GroupBy(u => u.ZoneId)
            .Select(g => new { ZoneId = g.Key, Count = g.Count() }).ToDictionaryAsync(x => x.ZoneId, x => x.Count);
        var adminCounts = await _db.AdminInfos.Where(a => a.Status).GroupBy(a => a.ZoneId)
            .Select(g => new { ZoneId = g.Key, Count = g.Count() }).ToDictionaryAsync(x => x.ZoneId, x => x.Count);

        var result = zones.Select(z => new ZoneDto
        {
            ZoneId = z.ZoneId,
            ZoneName = z.ZoneName,
            UserCount = (userCounts.GetValueOrDefault(z.ZoneId)) + (adminCounts.GetValueOrDefault(z.ZoneId)),
            VehicleCount = 0 // vehicle-to-zone is an assignment concept; see VehicleManagementController
        }).ToList();

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult> Create(CreateZoneRequest request)
    {
        if (await _db.Zones.AnyAsync(z => z.ZoneName == request.ZoneName))
            return Conflict(new { message = "A zone with this name already exists." });

        _db.Zones.Add(new Zone { ZoneName = request.ZoneName });
        await _db.SaveChangesAsync();
        return StatusCode(201);
    }

    [HttpPut("{zoneId:int}")]
    public async Task<ActionResult> Rename(int zoneId, CreateZoneRequest request)
    {
        var zone = await _db.Zones.FindAsync(zoneId);
        if (zone == null) return NotFound();
        zone.ZoneName = request.ZoneName;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // Blocked if any active admin/user/vehicle assignment still references
    // the zone, since admin_info/user_info.zone_id is a required FK.
    [HttpDelete("{zoneId:int}")]
    public async Task<ActionResult> Delete(int zoneId)
    {
        var inUse = await _db.AdminInfos.AnyAsync(a => a.ZoneId == zoneId && a.Status)
                 || await _db.UserInfos.AnyAsync(u => u.ZoneId == zoneId && u.Status);
        if (inUse)
            return Conflict(new { message = "Zone has active admins or users assigned; reassign them first." });

        var zone = await _db.Zones.FindAsync(zoneId);
        if (zone == null) return NotFound();
        _db.Zones.Remove(zone);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
