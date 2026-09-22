using System.ComponentModel.DataAnnotations;

namespace AllJobs.Application.Identity.DTOs;

public class RegisterRequest
{
    private const int EmailMaxLength = 320;
    private const int PasswordMinLength = 8;
    private const int NameMaxLength = 100;
    private const int MobileMaxLength = 30;
    private const int AddressMaxLength = 500;

    [Required]
    [EmailAddress]
    [MaxLength(EmailMaxLength)]
    public required string Email { get; set; }

    [Required]
    [MinLength(PasswordMinLength)]
    [RegularExpression(
        @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$",
        ErrorMessage = "Password must contain uppercase, lowercase, number and symbol.")]
    public required string Password { get; set; }

    [Required]
    [MaxLength(NameMaxLength)]
    public required string FirstName { get; set; }

    [Required]
    [MaxLength(NameMaxLength)]
    public required string LastName { get; set; }

    [Required]
    [MaxLength(MobileMaxLength)]
    public required string Mobile { get; set; }

    [Required]
    [MaxLength(AddressMaxLength)]
    public required string Address { get; set; }
}