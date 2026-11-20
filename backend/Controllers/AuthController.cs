using Microsoft.AspNetCore.Mvc;
using WasteTrack.API.Models.DTOs;
using WasteTrack.API.Services;

namespace WasteTrack.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth)
    {
        _auth = auth;
    }

    // Single login endpoint for all three roles — the account is looked up
    // across super_admin, admin_info and user_info by username, so the
    // client doesn't need to know the role up front.
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
    {
        var result = await _auth.LoginAsync(request);
        if (result == null)
            return Unauthorized(new { message = "Invalid username or password." });

        return Ok(result);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<LoginResponse>> Refresh(RefreshRequest request)
    {
        var result = await _auth.RefreshAsync(request.RefreshToken);
        if (result == null)
            return Unauthorized(new { message = "Invalid or expired refresh token." });

        return Ok(result);
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(RefreshRequest request)
    {
        await _auth.RevokeAsync(request.RefreshToken);
        return NoContent();
    }
}
