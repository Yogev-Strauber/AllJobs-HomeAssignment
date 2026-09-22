using AllJobs.Application.Products.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using AllJobs.Application.Identity.Exceptions;

namespace AllJobs.Api.Exceptions;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        ProblemDetails problemDetails;

        if (exception is DuplicateProductSkuException duplicateSkuException)
        {
            _logger.LogWarning(
                exception,
                "Duplicate product SKU conflict: {Sku}",
                duplicateSkuException.Sku);

            problemDetails = new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "Product SKU conflict",
                Detail = "A product with this SKU already exists."
            };
        }
        else if (exception is DuplicateUserEmailException duplicateEmailException)
        {
            _logger.LogWarning(
                exception,
                "Duplicate user email: {Email}",
                duplicateEmailException.Email);

            problemDetails = new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "Email conflict",
                Detail = "A user with this email already exists."
            };
        }
        else if (exception is UserNotFoundException)
        {
            problemDetails = new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "User not found",
                Detail = "No user exists with this email."
            };

            problemDetails.Extensions["code"] = "USER_NOT_FOUND";
        }
        else if (exception is InvalidCredentialsException)
        {
            problemDetails = new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Invalid credentials",
                Detail = "Invalid email or password."
            };
        }
        else
        {
            _logger.LogError(
                exception,
                "Unhandled exception occurred.");

            problemDetails = new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Unexpected server error",
                Detail = "An unexpected error occurred."
            };
        }

        httpContext.Response.StatusCode = problemDetails.Status.Value;

        await httpContext.Response.WriteAsJsonAsync(
            problemDetails,
            cancellationToken);

        return true;
    }
}