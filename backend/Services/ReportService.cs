using Microsoft.EntityFrameworkCore;
using WasteTrack.API.Data;
using WasteTrack.API.Models.DTOs;
using WasteTrack.API.Repositories;

namespace WasteTrack.API.Services;

public interface IReportService
{
    Task<List<ReportRowDto>> GenerateAsync(ReportFilter filter);
}

public class ReportService : IReportService
{
    private readonly ApplicationDbContext _db;
    private readonly ITransitRepository _transits;

    public ReportService(ApplicationDbContext db, ITransitRepository transits)
    {
        _db = db;
        _transits = transits;
    }

    public async Task<List<ReportRowDto>> GenerateAsync(ReportFilter filter)
    {
        var query = _db.Reports.AsNoTracking().AsQueryable();

        var fromDate = filter.From?.ToDateTime(TimeOnly.MinValue);
        var toDate = filter.To?.ToDateTime(TimeOnly.MaxValue);

        if (fromDate.HasValue)
            query = query.Where(r => r.Period >= fromDate.Value);
        
        if (toDate.HasValue)
            query = query.Where(r => r.Period <= toDate.Value);

        if (filter.ZoneId.HasValue)
            query = query.Where(r => r.ZoneId == filter.ZoneId.Value);

        if (filter.VehicleId.HasValue)
            query = query.Where(r => r.VehicleId == filter.VehicleId.Value);

        if (filter.UserId.HasValue)
            query = query.Where(r => r.UserId == filter.UserId.Value);

        var rows = await query.ToListAsync();

        var result = rows.Select(r => new ReportRowDto
        {
            Period = DateOnly.FromDateTime(r.Period),
            ZoneId = r.ZoneId,
            ZoneName = r.ZoneName ?? "Unknown",
            VehicleNumber = r.VehicleNumber,
            TotalWeightKg = r.TotalWeightKg,
            TripCount = r.TripCount
        })
        .OrderBy(r => r.Period).ThenBy(r => r.ZoneName)
        .ToList();

        return result;
    }

}
