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
public class VehicleManagementController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public VehicleManagementController(ApplicationDbContext db)
    {
        _db = db;
    }

    // Super Admin sees every vehicle; Admin sees only vehicles assigned to
    // their zone (via vehicle_zone_assignment); User has no vehicle access
    // per spec sidebar, so this route is 403 for User.
    [HttpGet]
    public async Task<ActionResult<List<VehicleDto>>> GetAll()
    {
        var role = User.Role();
        if (role == Roles.User) return Forbid();

        var query = from v in _db.Vehicles.AsNoTracking()
                     join vt in _db.VehicleTypes.AsNoTracking() on v.TypeId equals vt.VehicleId into vtj
                     from vt in vtj.DefaultIfEmpty()
                     join za in _db.VehicleZoneAssignments.AsNoTracking() on v.Id equals za.VehicleId into zaj
                     from za in zaj.DefaultIfEmpty()
                     join z in _db.Zones.AsNoTracking() on za.ZoneId equals z.ZoneId into zj
                     from z in zj.DefaultIfEmpty()
                     select new VehicleDto
                     {
                         Id = v.Id,
                         VehicleNumber = v.VehicleNumber,
                         VehicleType = vt != null ? vt.VehicleTypeName : null,
                         Capacity = vt != null ? vt.Capacity : null,
                         Status = v.Status,
                         DriverDetails = v.VehicleRemark,
                         AssignedZoneId = za != null ? za.ZoneId : (int?)null,
                         AssignedZoneName = z != null ? z.ZoneName : null
                     };

        if (role == Roles.Admin)
        {
            var zoneId = User.ZoneId();
            query = query.Where(v => v.AssignedZoneId == zoneId);
        }

        return Ok(await query.ToListAsync());
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<ActionResult> Create(CreateVehicleRequest request)
    {
        var existingVehicle = await _db.Vehicles.FirstOrDefaultAsync(v => v.VehicleNumber == request.VehicleNumber);
        if (existingVehicle != null)
        {
            return Conflict(new { message = $"A vehicle with the number '{request.VehicleNumber}' already exists." });
        }

        var maxId = await _db.Vehicles.MaxAsync(v => (int?)v.Id) ?? 0; 
        var vehicle = new Vehicle 
        { 
            Id = maxId + 1,
            VehicleNumber = request.VehicleNumber,
            TypeId = request.TypeId,
            TagId = request.TagId,
            VehicleRemark = request.DriverDetails,
            Status = true,
            AddedBy = User.AccountId(),
            AddedOn = DateTime.UtcNow
        };
        _db.Vehicles.Add(vehicle);
        await _db.SaveChangesAsync();

        if (request.AssignedZoneId.HasValue)
        {
            _db.VehicleZoneAssignments.Add(new VehicleZoneAssignment
            {
                VehicleId = vehicle.Id,
                ZoneId = request.AssignedZoneId.Value
            });
            await _db.SaveChangesAsync();
        }

        return StatusCode(201, new 
        { 
            message = "Vehicle created successfully", 
            vehicleId = vehicle.Id 
        });
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult> Update(int id, UpdateVehicleRequest request)
    {
        var vehicle = await _db.Vehicles.FindAsync(id);
        if (vehicle == null) return NotFound();

        if (request.TypeId.HasValue) vehicle.TypeId = request.TypeId.Value;
        if (request.DriverDetails != null) vehicle.VehicleRemark = request.DriverDetails;
        if (request.Status.HasValue) vehicle.Status = request.Status.Value;
        vehicle.UpdatedBy = User.AccountId();
        vehicle.UpdatedOn = DateTime.UtcNow;

        if (request.AssignedZoneId.HasValue)
        {
            var assignment = await _db.VehicleZoneAssignments.FindAsync(id);
            if (assignment == null)
                _db.VehicleZoneAssignments.Add(new VehicleZoneAssignment { VehicleId = id, ZoneId = request.AssignedZoneId.Value });
            else
            {
                assignment.ZoneId = request.AssignedZoneId.Value;
                assignment.AssignedOn = DateTime.UtcNow;
            }
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Deactivate(int id)
    {
        var vehicle = await _db.Vehicles.FindAsync(id);
        if (vehicle == null) return NotFound();
        vehicle.Status = false;
        vehicle.UpdatedBy = User.AccountId();
        vehicle.UpdatedOn = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
