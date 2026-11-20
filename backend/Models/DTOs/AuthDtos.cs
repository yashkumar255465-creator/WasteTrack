namespace WasteTrack.API.Models.DTOs;

public class LoginRequest
{
    public string Uname { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime ExpiresOn { get; set; }
    public string Role { get; set; } = string.Empty; // "SuperAdmin" | "Admin" | "User"
    public int AccountId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int? ZoneId { get; set; }
    public string? ZoneName { get; set; }
}

public class RefreshRequest
{
    public string RefreshToken { get; set; } = string.Empty;
}
