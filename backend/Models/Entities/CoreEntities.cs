namespace WasteTrack.API.Models.Entities;

// dbo.role
public class Role
{
    public int Id { get; set; }
    public string RoleName { get; set; } = string.Empty; // "Super Admin" | "Admin" | "User"
    public string? Description { get; set; }
    public bool Status { get; set; } = true;
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    public ICollection<AdminInfo> AdminInfos { get; set; } = new List<AdminInfo>();
    public ICollection<UserInfo> UserInfos { get; set; } = new List<UserInfo>();
    public ICollection<SuperAdmin> SuperAdmins { get; set; } = new List<SuperAdmin>();
}

// dbo.zone
public class Zone
{
    public int ZoneId { get; set; }
    public string ZoneName { get; set; } = string.Empty;

    public ICollection<AdminInfo> AdminInfos { get; set; } = new List<AdminInfo>();
    public ICollection<UserInfo> UserInfos { get; set; } = new List<UserInfo>();
    public ICollection<InternalTransit> Transits { get; set; } = new List<InternalTransit>();
}

// dbo.super_admin -> Role: Super Admin (system-wide, no zone)
public class SuperAdmin
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Uname { get; set; } = string.Empty;
    public string Pwd { get; set; } = string.Empty; // bcrypt hash
    public int RoleId { get; set; }
    public bool Status { get; set; } = true;
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    public Role? Role { get; set; }
}

// dbo.admin_info -> Role: Admin (zone-scoped)
public class AdminInfo
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Designation { get; set; }
    public string? Department { get; set; }
    public string Uname { get; set; } = string.Empty;
    public string Pwd { get; set; } = string.Empty;
    public int RoleId { get; set; }
    public int ZoneId { get; set; }
    public bool Status { get; set; } = true;
    public int? AddedBy { get; set; }
    public DateTime AddedOn { get; set; } = DateTime.UtcNow;

    public Role? Role { get; set; }
    public Zone? Zone { get; set; }
}

// dbo.user_info -> Role: User (zone-scoped, view-only)
public class UserInfo
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Designation { get; set; }
    public string? Department { get; set; }
    public string Uname { get; set; } = string.Empty;
    public string Pwd { get; set; } = string.Empty;
    public int RoleId { get; set; }
    public int ZoneId { get; set; }
    public bool Status { get; set; } = true;
    public int? AddedBy { get; set; }
    public DateTime AddedOn { get; set; } = DateTime.UtcNow;

    public Role? Role { get; set; }
    public Zone? Zone { get; set; }
}

// dbo.api_user (device/API level auth, linked to user_info.id)
public class ApiUser
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Pwd { get; set; } = string.Empty;
    public bool Status { get; set; } = true;
}

// dbo.owner
public class Owner
{
    public int Id { get; set; }
    public string? Type { get; set; }
}

// dbo.fleet
public class Fleet
{
    public int Id { get; set; }
    public string? FleetName { get; set; }
}

// dbo.vehicle_type
public class VehicleType
{
    public int VehicleId { get; set; } // PK per source schema
    public string VehicleTypeName { get; set; } = string.Empty;
    public decimal? Capacity { get; set; }
}

// dbo.vehicle
public class Vehicle
{
    public int Id { get; set; }
    public string VehicleNumber { get; set; } = string.Empty;
    public int TypeId { get; set; }
    public bool Status { get; set; } = true;
    public string? TagId { get; set; }
    public int? AddedBy { get; set; }
    public DateTime? AddedOn { get; set; }
    public int? TaggedBy { get; set; }
    public DateTime? TaggedOn { get; set; }
    public int? UpdatedBy { get; set; }
    public DateTime? UpdatedOn { get; set; }
    public string? VehicleRemark { get; set; }

    // Not in physical schema as FK, but every trip carries zone_id; we surface
    // "current assigned zone" via the latest trip / an explicit assignment table
    // managed at the application layer (VehicleZoneAssignment).
    public VehicleType? VehicleTypeNav { get; set; }
}

// dbo.waste
public class Waste
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

// dbo.waste_type
public class WasteType
{
    public int Id { get; set; }
    public string WasteName { get; set; } = string.Empty;
    public int WasteId { get; set; }
    public bool Status { get; set; } = true;
    public int? AddedBy { get; set; }
    public DateTime? AddedOn { get; set; }
    public int? UpdatedBy { get; set; }
    public DateTime? UpdatedOn { get; set; }
}

// dbo.internal_transit — the consolidated trip/collection table (primary source
// for dashboard + reports). peelamedu / sathy_road / ukkadam are legacy
// per-zone mirror tables with the same shape; see TransitRepository for how
// they're merged in.
public class InternalTransit
{
    public int TripId { get; set; }
    public string? VehicleTagId { get; set; }
    public string? VehicleNumber { get; set; }
    public int? OwnerId { get; set; }
    public int? FleetId { get; set; }
    public int ZoneId { get; set; }
    public decimal? InWeight { get; set; }
    public decimal? OutWeight { get; set; }
    public DateTime? InTime { get; set; }
    public string? OutTime { get; set; }
    public int? TotalTime { get; set; }
    public int? UserId { get; set; }
    public string? Trace { get; set; }
    public bool? Sync { get; set; }
    public int? LocationId { get; set; }
    public string? ContainerTagId { get; set; }
    public string? ContainerNumber { get; set; }
    public int? COwnerId { get; set; }
    public decimal? TotalWeight { get; set; }
    public DateTime? Datsign { get; set; }
    public int? WardId { get; set; }
    public int? WasteType { get; set; }
    public string? Maturation { get; set; }

    public Zone? Zone { get; set; }
}

// Lightweight DTO-shaped record used when reading the legacy per-zone mirror
// tables (peelamedu, sathy_road, ukkadam) via raw SQL — see TransitRepository.
public class LegacyTransitRecord
{
    public int TripId { get; set; }
    public string? VehicleNumber { get; set; }
    public int ZoneId { get; set; }
    public decimal? TotalWeight { get; set; }
    public DateTime? InTime { get; set; }
    public string? OutTime { get; set; }
    public int? WardId { get; set; }
    public int? WasteId { get; set; }
    public string SourceTable { get; set; } = string.Empty;
}

// dbo.Reports
public class Report
{
    public int ReportId { get; set; }
    public DateTime Period { get; set; }
    public int ZoneId { get; set; }
    public string? ZoneName { get; set; }
    public int? VehicleId { get; set; }
    public string? VehicleNumber { get; set; }
    public int? UserId { get; set; }
    public decimal TotalWeightKg { get; set; }
    public int TripCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
