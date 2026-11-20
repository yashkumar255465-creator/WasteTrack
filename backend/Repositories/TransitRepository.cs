using Microsoft.EntityFrameworkCore;
using WasteTrack.API.Data;
using WasteTrack.API.Models.Entities;

namespace WasteTrack.API.Repositories;

/// <summary>
/// peelamedu, sathy_road and ukkadam are legacy per-zone mirror tables that
/// predate internal_transit (same columns as internal_transit, minus
/// waste_type/maturation, plus waste_id). New trips should be written to
/// internal_transit going forward; this repository reads all four and unions
/// them so dashboards/reports don't silently miss historical data.
/// </summary>
public interface ITransitRepository
{
    Task<List<LegacyTransitRecord>> GetAllAsync(DateTime? from, DateTime? to, int? zoneId = null);
}

public class TransitRepository : ITransitRepository
{
    private readonly ApplicationDbContext _db;
    private static readonly (string Table, string ZoneName)[] LegacyTables =
    {
        ("peelamedu", "Peelamedu"),
        ("sathy_road", "Sathy Road"),
        ("ukkadam", "Ukkadam")
    };

    public TransitRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<LegacyTransitRecord>> GetAllAsync(DateTime? from, DateTime? to, int? zoneId = null)
    {
        var results = new List<LegacyTransitRecord>();

        // Primary source
        var primaryQuery = _db.InternalTransits.AsNoTracking().AsQueryable();
        if (from.HasValue) primaryQuery = primaryQuery.Where(t => t.InTime >= from);
        if (to.HasValue) primaryQuery = primaryQuery.Where(t => t.InTime <= to);
        if (zoneId.HasValue) primaryQuery = primaryQuery.Where(t => t.ZoneId == zoneId);

        var primary = await primaryQuery.Select(t => new LegacyTransitRecord
        {
            TripId = t.TripId,
            VehicleNumber = t.VehicleNumber,
            ZoneId = t.ZoneId,
            TotalWeight = t.TotalWeight,
            InTime = t.InTime,
            OutTime = t.OutTime,
            WardId = t.WardId,
            WasteId = t.WasteType,
            SourceTable = "internal_transit"
        }).ToListAsync();
        results.AddRange(primary);

        // Legacy mirror tables — raw SQL since they aren't mapped as DbSets
        // (their zone_id values overlap with internal_transit's, so we tag
        // SourceTable to make de-duplication possible downstream if needed).
        foreach (var (table, _) in LegacyTables)
        {
            var sql = $@"SELECT trip_id, vehicle_number, zone_id, total_weight, in_time, out_time, ward_id, waste_id
                         FROM dbo.[{table}]
                         WHERE (@from IS NULL OR in_time >= @from)
                           AND (@to IS NULL OR in_time <= @to)
                           AND (@zoneId IS NULL OR zone_id = @zoneId)";

            var rows = await _db.Database.SqlQueryRaw<LegacyRow>(sql,
                    new Microsoft.Data.SqlClient.SqlParameter("@from", (object?)from ?? DBNull.Value),
                    new Microsoft.Data.SqlClient.SqlParameter("@to", (object?)to ?? DBNull.Value),
                    new Microsoft.Data.SqlClient.SqlParameter("@zoneId", (object?)zoneId ?? DBNull.Value))
                .ToListAsync();

            results.AddRange(rows.Select(r => new LegacyTransitRecord
            {
                TripId = r.trip_id,
                VehicleNumber = r.vehicle_number,
                ZoneId = r.zone_id,
                TotalWeight = r.total_weight,
                InTime = r.in_time,
                OutTime = r.out_time,
                WardId = r.ward_id,
                WasteId = r.waste_id,
                SourceTable = table
            }));
        }

        return results;
    }

    // Shape for SqlQueryRaw mapping
    private class LegacyRow
    {
        public int trip_id { get; set; }
        public string? vehicle_number { get; set; }
        public int zone_id { get; set; }
        public decimal? total_weight { get; set; }
        public DateTime? in_time { get; set; }
        public string? out_time { get; set; }
        public int? ward_id { get; set; }
        public int? waste_id { get; set; }
    }
}
