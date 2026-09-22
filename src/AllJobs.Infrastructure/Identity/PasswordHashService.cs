using AllJobs.Application.Identity.Security;
using AllJobs.Domain.Identity;
using Microsoft.AspNetCore.Identity;

namespace AllJobs.Infrastructure.Identity;

public class PasswordHashService : IPasswordHashService
{
    private readonly PasswordHasher<User> _passwordHasher = new();

    public string Hash(User user, string password)
    {
        return _passwordHasher.HashPassword(user, password);
    }

    public bool Verify(User user, string passwordHash, string password)
    {
        var result = _passwordHasher.VerifyHashedPassword(
            user,
            passwordHash,
            password);

        return result != PasswordVerificationResult.Failed;
    }
}