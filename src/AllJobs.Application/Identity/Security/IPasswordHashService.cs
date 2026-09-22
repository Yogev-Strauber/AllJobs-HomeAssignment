using AllJobs.Domain.Identity;

namespace AllJobs.Application.Identity.Security;

public interface IPasswordHashService
{
    string Hash(User user, string password);
    bool Verify(User user, string passwordHash, string password);
}