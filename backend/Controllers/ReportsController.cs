using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WasteTrack.API.Helpers;
using WasteTrack.API.Models.DTOs;
using WasteTrack.API.Services;

namespace WasteTrack.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reports;

    public ReportsController(IReportService reports)
    {
        _reports = reports;
    }

    // Super Admin: zone-wise / vehicle-wise / user-wise reports across the
    // whole system (zoneId/vehicleId optional filters).
    // Admin: same shape but always forced to their own zone.
    // User: same shape but forced to their own zone and vehicle filter is
    // still permitted (read-only either way — no export-all).
    [HttpGet]
    public async Task<ActionResult<List<ReportRowDto>>> Get([FromQuery] ReportFilter filter)
    {
        var role = User.Role();

        // Bypass check if testing without auth
        if (!string.IsNullOrEmpty(role) && role != Roles.SuperAdmin)
        {
            var userZone = User.ZoneId();
            if (userZone == null) return Forbid();
            filter.ZoneId = userZone; // Admin/User can never widen scope beyond their own zone
        }

        var result = await _reports.GenerateAsync(filter);
        return Ok(result);
    }

    // CSV export of the same filtered rows — available to Super Admin and
    // Admin (matches "Export reports" in the Super Admin spec; Admin's zone
    // reports are exportable too since the sidebar just says "Reports").
    [HttpGet("export")]
    public async Task<IActionResult> Export([FromQuery] ReportFilter filter)
    {
        var role = User.Role();

        // Bypass check if testing without auth
        if (!string.IsNullOrEmpty(role) && role == Roles.Admin)
            filter.ZoneId = User.ZoneId();

        var rows = await _reports.GenerateAsync(filter);

        var csv = "Period,ZoneId,ZoneName,VehicleNumber,TotalWeightKg,TripCount\n" +
            string.Join("\n", rows.Select(r =>
                $"{r.Period:yyyy-MM-dd},{r.ZoneId},{r.ZoneName},{r.VehicleNumber},{r.TotalWeightKg},{r.TripCount}"));

        var bytes = System.Text.Encoding.UTF8.GetBytes(csv);
        return File(bytes, "text/csv", $"report_{DateTime.UtcNow:yyyyMMddHHmmss}.csv");
    }
}
