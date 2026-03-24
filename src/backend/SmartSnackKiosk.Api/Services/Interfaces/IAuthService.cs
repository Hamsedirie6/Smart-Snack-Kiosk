using SmartSnackKiosk.Api.DTOs.Auth;

namespace SmartSnackKiosk.Api.Services.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
}