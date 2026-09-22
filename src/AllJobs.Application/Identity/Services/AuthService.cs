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
    private readonly ITokenService _tokenService;

    public AuthService(
        IUserRepository userRepository,
        IPasswordHashService passwordHashService,
            ITokenService tokenService)

    {
        _userRepository = userRepository;
        _passwordHashService = passwordHashService;
        _tokenService = tokenService;

    }

    public async Task<AuthResult> RegisterAsync(RegisterRequest request)
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

        user.Id = await _userRepository.CreateAsync(user);

        var accessToken = _tokenService.CreateAccessToken(user);

        return CreateAuthResult(user, accessToken);
    }

    public async Task<AuthResult> LoginAsync(LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        var user = await _userRepository.GetByEmailAsync(email);

        if (user is null)
        {
            throw new UserNotFoundException(email);
        }

        var passwordIsValid = _passwordHashService.Verify(
            user,
            user.PasswordHash,
            request.Password);

        if (!passwordIsValid)
        {
            throw new InvalidCredentialsException();
        }

        var accessToken = _tokenService.CreateAccessToken(user);

        return CreateAuthResult(user, accessToken);
    }


    private static AuthResult CreateAuthResult(
        User user,
        string accessToken)
    {
        return new AuthResult
        {
            AccessToken = accessToken,
            UserId = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = user.Role
        };
    }

}