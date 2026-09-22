namespace AllJobs.Application.Identity.Exceptions;

public class DuplicateUserEmailException : Exception
{
    public string Email { get; }

    public DuplicateUserEmailException(string email, Exception? innerException = null)
        : base("A user with this email already exists.", innerException)
    {
        Email = email;
    }
}