using AllJobs.Application.Identity.DTOs;
using AllJobs.Application.Identity.Services;
using Microsoft.AspNetCore.Mvc;

namespace AllJobs.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResult>> Register(
        RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);

        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResult>> Login(
        LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);

        return Ok(result);
    }
}