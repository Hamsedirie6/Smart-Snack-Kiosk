namespace SmartSnackKiosk.Api.DTOs.Auth;

public class LoginResponseDto
{
    public string Token { get; set; }
    public string Username { get; set; }
    public DateTime ExpiresAt { get; set; }
}