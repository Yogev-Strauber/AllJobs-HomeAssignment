using AllJobs.Domain.Identity;

namespace AllJobs.Application.Identity.Security;

public interface ITokenService
{
    string CreateAccessToken(User user);
}