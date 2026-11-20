using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WasteTrack.API.Helpers;
using WasteTrack.API.Services;

namespace WasteTrack.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboard;

    public DashboardController(IDashboardService dashboard)
    {
        _dashboard = dashboard;
    }

    // Returns the shape appropriate to the caller's role. Super Admin gets the
    // system-wide view; Admin/User are hard-scoped to the zone_id in their
    // token, never to a zone_id from the querystring/body.
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var role = User.Role();

        if (role == Roles.SuperAdmin)
            return Ok(await _dashboard.GetSuperAdminDashboardAsync());

        var zoneId = User.ZoneId();
        if (zoneId == null)
            return Forbid();

        if (role == Roles.Admin)
            return Ok(await _dashboard.GetAdminDashboardAsync(zoneId.Value));

        if (role == Roles.User)
            return Ok(await _dashboard.GetUserDashboardAsync(zoneId.Value));

        return Forbid();
    }
}
