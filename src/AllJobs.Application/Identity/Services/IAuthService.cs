using AllJobs.Application.Identity.DTOs;

namespace AllJobs.Application.Identity.Services;

public interface IAuthService
{
    Task<AuthResult> RegisterAsync(RegisterRequest request);

    Task<AuthResult> LoginAsync(LoginRequest request);

}