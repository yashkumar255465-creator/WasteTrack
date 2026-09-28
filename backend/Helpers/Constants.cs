using System.Security.Claims;

namespace WasteTrack.API.Helpers;

public static class Roles
{
    public const string SuperAdmin = "SuperAdmin";
    public const string Admin = "Admin";
    public const string User = "User";

    public const string AdminOrAbove = "SuperAdmin,Admin";
    public const string Any = "SuperAdmin,Admin,User";
}

// Reads the authenticated principal's claims — used by controllers/services to
// enforce zone scoping without re-deriving it from the DB on every call.
public static class CurrentUserExtensions
{
    public static string Role(this ClaimsPrincipal user) =>
        user.FindFirstValue(ClaimTypes.Role) ?? string.Empty;

    public static int AccountId(this ClaimsPrincipal user) =>
        int.Parse(user.FindFirstValue("account_id") ?? "0");

    public static int? ZoneId(this ClaimsPrincipal user)
    {
        var v = user.FindFirstValue("zone_id");
        return string.IsNullOrEmpty(v) ? null : int.Parse(v);
    }

    public static bool IsSuperAdmin(this ClaimsPrincipal user) => user.Role() == Roles.SuperAdmin;
}
