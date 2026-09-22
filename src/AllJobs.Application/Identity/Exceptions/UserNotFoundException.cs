namespace AllJobs.Application.Identity.Exceptions;

public class UserNotFoundException : Exception
{
    public string Email { get; }

    public UserNotFoundException(string email)
        : base("No user exists with this email.")
    {
        Email = email;
    }
}