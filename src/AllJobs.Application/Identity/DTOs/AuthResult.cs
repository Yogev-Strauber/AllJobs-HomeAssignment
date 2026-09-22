using AllJobs.Domain.Identity;

namespace AllJobs.Application.Identity.DTOs;

public class AuthResult
{
    public required string AccessToken { get; set; }
    public int UserId { get; set; }
    public required string Email { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public UserRole Role { get; set; }
}