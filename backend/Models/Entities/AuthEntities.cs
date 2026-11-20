namespace WasteTrack.API.Models.Entities;

public enum AppRole
{
    SuperAdmin = 1,
    Admin = 2,
    User = 3
}

// Application-level table (new — not in the original dump) to persist
// refresh tokens across the three login tables uniformly.
public class RefreshToken
{
    public int Id { get; set; }
    public string Token { get; set; } = string.Empty;
    public string AccountUname { get; set; } = string.Empty; // uname of the account
    public AppRole Role { get; set; }
    public DateTime ExpiresOn { get; set; }
    public bool Revoked { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
}

// Application-level table (new — the dbo.vehicle table has no zone column).
// Tracks which zone a vehicle is currently assigned to, so Super Admin's
// "Vehicle Management" and Admin's zone-scoped vehicle list both work off
// one place instead of inferring assignment from trip history.
public class VehicleZoneAssignment
{
    public int VehicleId { get; set; } // FK -> vehicle.id, also PK (one active zone per vehicle)
    public int ZoneId { get; set; }
    public DateTime AssignedOn { get; set; } = DateTime.UtcNow;
}
