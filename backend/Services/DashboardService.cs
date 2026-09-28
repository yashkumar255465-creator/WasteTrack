using Microsoft.EntityFrameworkCore;
using WasteTrack.API.Data;
using WasteTrack.API.Models.DTOs;
using WasteTrack.API.Repositories;

namespace WasteTrack.API.Services;

public interface IDashboardService
{
    Task<SuperAdminDashboardDto> GetSuperAdminDashboardAsync();
    Task<AdminDashboardDto> GetAdminDashboardAsync(int zoneId);
    Task<UserDashboardDto> GetUserDashboardAsync(int zoneId);
}

public class DashboardService : IDashboardService
{
    private readonly ApplicationDbContext _db;
    private readonly ITransitRepository _transits;

    public DashboardService(ApplicationDbContext db, ITransitRepository transits)
    {
        _db = db;
        _transits = transits;
    }

    public async Task<SuperAdminDashboardDto> GetSuperAdminDashboardAsync()
    {
        var today = DateTime.UtcNow.Date;
        var monthStart = new DateTime(today.Year, today.Month, 1);

        var totalUsers = await _db.UserInfos.CountAsync(u => u.Status);
        var totalAdmins = await _db.AdminInfos.CountAsync(a => a.Status);
        var totalVehicles = await _db.Vehicles.CountAsync(v => v.Status);
        var totalZones = await _db.Zones.CountAsync();

        var monthTrips = await _transits.GetAllAsync(monthStart, null);
        var todayTrips = monthTrips.Where(t => t.InTime?.Date == today).ToList();

        var zones = await _db.Zones.AsNoTracking().ToListAsync();
        var zoneWise = zones.Select(z => new ZoneCollectionDto
        {
            ZoneId = z.ZoneId,
            ZoneName = z.ZoneName,
            TotalWeightKg = monthTrips.Where(t => t.ZoneId == z.ZoneId).Sum(t => t.TotalWeight ?? 0),
            TripCount = monthTrips.Count(t => t.ZoneId == z.ZoneId)
        }).ToList();

        var vehicleActivity = todayTrips
            .Where(t => t.VehicleNumber != null)
            .GroupBy(t => t.VehicleNumber)
            .Select(g => new VehicleActivityDto
            {
                VehicleNumber = g.Key!,
                TripsToday = g.Count(),
                WeightTodayKg = g.Sum(t => t.TotalWeight ?? 0),
                LastActive = g.Max(t => t.InTime)
            }).OrderByDescending(v => v.WeightTodayKg).Take(10).ToList();

        var trend = monthTrips
            .Where(t => t.InTime.HasValue)
            .GroupBy(t => DateOnly.FromDateTime(t.InTime!.Value.Date))
            .Select(g => new DailyTrendPointDto { Date = g.Key, TotalWeightKg = g.Sum(t => t.TotalWeight ?? 0) })
            .OrderBy(x => x.Date).ToList();

        var recent = monthTrips
            .Where(t => t.InTime.HasValue)
            .OrderByDescending(t => t.InTime)
            .Take(15)
            .Select(t => new RecentActivityDto
            {
                Description = $"Vehicle {t.VehicleNumber ?? "N/A"} collected {t.TotalWeight ?? 0} kg in zone {t.ZoneId}",
                OccurredOn = t.InTime!.Value
            }).ToList();

        return new SuperAdminDashboardDto
        {
            TotalUsers = totalUsers,
            TotalAdmins = totalAdmins,
            TotalVehicles = totalVehicles,
            TotalZones = totalZones,
            WasteCollectionTodayKg = todayTrips.Sum(t => t.TotalWeight ?? 0),
            WasteCollectionMonthKg = monthTrips.Sum(t => t.TotalWeight ?? 0),
            ZoneWiseCollection = zoneWise,
            VehicleActivity = vehicleActivity,
            RecentActivities = recent,
            CollectionTrend = trend
        };
    }

    public async Task<AdminDashboardDto> GetAdminDashboardAsync(int zoneId)
    {
        var today = DateTime.UtcNow.Date;
        var monthStart = new DateTime(today.Year, today.Month, 1);
        var zone = await _db.Zones.AsNoTracking().FirstOrDefaultAsync(z => z.ZoneId == zoneId);

        var monthTrips = await _transits.GetAllAsync(monthStart, null, zoneId);
        var todayTrips = monthTrips.Where(t => t.InTime?.Date == today).ToList();

        var vehiclesInZone = await _db.Vehicles.CountAsync(v => v.Status); // vehicle->zone is via trip/assignment, see VehicleController

        var vehicleActivity = todayTrips
            .Where(t => t.VehicleNumber != null)
            .GroupBy(t => t.VehicleNumber)
            .Select(g => new VehicleActivityDto
            {
                VehicleNumber = g.Key!,
                TripsToday = g.Count(),
                WeightTodayKg = g.Sum(t => t.TotalWeight ?? 0),
                LastActive = g.Max(t => t.InTime)
            }).OrderByDescending(v => v.WeightTodayKg).ToList();

        var trend = monthTrips
            .Where(t => t.InTime.HasValue)
            .GroupBy(t => DateOnly.FromDateTime(t.InTime!.Value.Date))
            .Select(g => new DailyTrendPointDto { Date = g.Key, TotalWeightKg = g.Sum(t => t.TotalWeight ?? 0) })
            .OrderBy(x => x.Date).ToList();

        return new AdminDashboardDto
        {
            ZoneId = zoneId,
            ZoneName = zone?.ZoneName ?? string.Empty,
            VehiclesInZone = vehiclesInZone,
            WasteCollectionTodayKg = todayTrips.Sum(t => t.TotalWeight ?? 0),
            WasteCollectionMonthKg = monthTrips.Sum(t => t.TotalWeight ?? 0),
            TripsToday = todayTrips.Count,
            VehicleActivity = vehicleActivity,
            CollectionTrend = trend
        };
    }

    public async Task<UserDashboardDto> GetUserDashboardAsync(int zoneId)
    {
        var today = DateTime.UtcNow.Date;
        var monthStart = new DateTime(today.Year, today.Month, 1);
        var zone = await _db.Zones.AsNoTracking().FirstOrDefaultAsync(z => z.ZoneId == zoneId);

        var monthTrips = await _transits.GetAllAsync(monthStart, null, zoneId);
        var todayTrips = monthTrips.Where(t => t.InTime?.Date == today).ToList();

        var trend = monthTrips
            .Where(t => t.InTime.HasValue)
            .GroupBy(t => DateOnly.FromDateTime(t.InTime!.Value.Date))
            .Select(g => new DailyTrendPointDto { Date = g.Key, TotalWeightKg = g.Sum(t => t.TotalWeight ?? 0) })
            .OrderBy(x => x.Date).ToList();

        return new UserDashboardDto
        {
            ZoneId = zoneId,
            ZoneName = zone?.ZoneName ?? string.Empty,
            WasteCollectionTodayKg = todayTrips.Sum(t => t.TotalWeight ?? 0),
            WasteCollectionMonthKg = monthTrips.Sum(t => t.TotalWeight ?? 0),
            TripsToday = todayTrips.Count,
            CollectionTrend = trend
        };
    }
}
