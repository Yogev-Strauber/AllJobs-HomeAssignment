using AllJobs.Domain.Identity;

namespace AllJobs.Application.Identity.Repositories;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<int> CreateAsync(User user);
}