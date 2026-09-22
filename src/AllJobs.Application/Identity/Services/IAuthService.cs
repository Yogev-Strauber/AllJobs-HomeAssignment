using AllJobs.Application.Identity.DTOs;

namespace AllJobs.Application.Identity.Services;

public interface IAuthService
{
    Task<int> RegisterAsync(RegisterRequest request);
}