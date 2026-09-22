using AllJobs.Application.Identity.DTOs;
using AllJobs.Application.Identity.Exceptions;
using AllJobs.Application.Identity.Repositories;
using AllJobs.Application.Identity.Security;
using AllJobs.Domain.Identity;

namespace AllJobs.Application.Identity.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHashService _passwordHashService;

    public AuthService(
        IUserRepository userRepository,
        IPasswordHashService passwordHashService)
    {
        _userRepository = userRepository;
        _passwordHashService = passwordHashService;
    }

    public async Task<int> RegisterAsync(RegisterRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        var existingUser = await _userRepository.GetByEmailAsync(email);

        if (existingUser is not null)
        {
            throw new DuplicateUserEmailException(email);
        }

        var now = DateTime.UtcNow;

        var user = new User
        {
            Email = email,
            PasswordHash = string.Empty,
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Mobile = request.Mobile.Trim(),
            Address = request.Address.Trim(),
            Role = UserRole.Viewer,
            CreatedAt = now,
            UpdatedAt = now
        };

        user.PasswordHash = _passwordHashService.Hash(
            user,
            request.Password);

        return await _userRepository.CreateAsync(user);
    }
}