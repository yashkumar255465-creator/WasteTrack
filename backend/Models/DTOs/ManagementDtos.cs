namespace WasteTrack.API.Models.DTOs;

// ---------- User Management ----------
public class UserListItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Uname { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty; // SuperAdmin | Admin | User
    public int? ZoneId { get; set; }
    public string? ZoneName { get; set; }
    public bool Status { get; set; }
    public DateTime AddedOn { get; set; }
}

public class CreateUserRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Designation { get; set; }
    public string? Department { get; set; }
    public string Uname { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty; // "Admin" | "User" (SuperAdmin created only by another SuperAdmin)
    public int? ZoneId { get; set; } // required for Admin/User
}

public class UpdateUserRequest
{
    public string? Name { get; set; }
    public string? Designation { get; set; }
    public string? Department { get; set; }
    public int? ZoneId { get; set; }
    public bool? Status { get; set; }
    public string? NewPassword { get; set; }
}

// ---------- Zone Management ----------
public class ZoneDto
{
    public int ZoneId { get; set; }
    public string ZoneName { get; set; } = string.Empty;
    public int VehicleCount { get; set; }
    public int UserCount { get; set; }
}

public class CreateZoneRequest
{
    public string ZoneName { get; set; } = string.Empty;
}

// ---------- Vehicle Management ----------
public class VehicleDto
{
    public int Id { get; set; }
    public string VehicleNumber { get; set; } = string.Empty;
    public string? VehicleType { get; set; }
    public decimal? Capacity { get; set; }
    public bool Status { get; set; }
    public string? DriverDetails { get; set; } // stored in vehicle_remark
    public int? AssignedZoneId { get; set; }
    public string? AssignedZoneName { get; set; }
}

public class CreateVehicleRequest
{
    public string VehicleNumber { get; set; } = string.Empty;
    public int TypeId { get; set; }
    public string? TagId { get; set; }
    public string? DriverDetails { get; set; }
    public int? AssignedZoneId { get; set; }
}

public class UpdateVehicleRequest
{
    public int? TypeId { get; set; }
    public string? DriverDetails { get; set; }
    public int? AssignedZoneId { get; set; }
    public bool? Status { get; set; }
}

// ---------- Dashboard ----------
public class SuperAdminDashboardDto
{
    public int TotalUsers { get; set; }
    public int TotalAdmins { get; set; }
    public int TotalVehicles { get; set; }
    public int TotalZones { get; set; }
    public decimal WasteCollectionTodayKg { get; set; }
    public decimal WasteCollectionMonthKg { get; set; }
    public List<ZoneCollectionDto> ZoneWiseCollection { get; set; } = new();
    public List<VehicleActivityDto> VehicleActivity { get; set; } = new();
    public List<RecentActivityDto> RecentActivities { get; set; } = new();
    public List<DailyTrendPointDto> CollectionTrend { get; set; } = new();
}

public class AdminDashboardDto
{
    public int ZoneId { get; set; }
    public string ZoneName { get; set; } = string.Empty;
    public int VehiclesInZone { get; set; }
    public decimal WasteCollectionTodayKg { get; set; }
    public decimal WasteCollectionMonthKg { get; set; }
    public int TripsToday { get; set; }
    public List<VehicleActivityDto> VehicleActivity { get; set; } = new();
    public List<DailyTrendPointDto> CollectionTrend { get; set; } = new();
}

public class UserDashboardDto
{
    public int ZoneId { get; set; }
    public string ZoneName { get; set; } = string.Empty;
    public decimal WasteCollectionTodayKg { get; set; }
    public decimal WasteCollectionMonthKg { get; set; }
    public int TripsToday { get; set; }
    public List<DailyTrendPointDto> CollectionTrend { get; set; } = new();
}

public class ZoneCollectionDto
{
    public int ZoneId { get; set; }
    public string ZoneName { get; set; } = string.Empty;
    public decimal TotalWeightKg { get; set; }
    public int TripCount { get; set; }
}

public class VehicleActivityDto
{
    public int VehicleId { get; set; }
    public string VehicleNumber { get; set; } = string.Empty;
    public int TripsToday { get; set; }
    public decimal WeightTodayKg { get; set; }
    public DateTime? LastActive { get; set; }
}

public class RecentActivityDto
{
    public string Description { get; set; } = string.Empty;
    public DateTime OccurredOn { get; set; }
}

public class DailyTrendPointDto
{
    public DateOnly Date { get; set; }
    public decimal TotalWeightKg { get; set; }
}

// ---------- Reports ----------
public class ReportFilter
{
    public int? ZoneId { get; set; }
    public int? VehicleId { get; set; }
    public int? UserId { get; set; }
    public DateOnly? From { get; set; }
    public DateOnly? To { get; set; }
    public string Granularity { get; set; } = "daily"; // daily | weekly | monthly
}

public class ReportRowDto
{
    public DateOnly Period { get; set; }
    public int ZoneId { get; set; }
    public string ZoneName { get; set; } = string.Empty;
    public string? VehicleNumber { get; set; }
    public decimal TotalWeightKg { get; set; }
    public int TripCount { get; set; }
}
