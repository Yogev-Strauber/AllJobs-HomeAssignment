using System.ComponentModel.DataAnnotations;

namespace AllJobs.Application.Identity.DTOs;

public class LoginRequest
{
    [Required]
    [EmailAddress]
    public required string Email { get; set; }

    [Required]
    public required string Password { get; set; }
}