using AllJobs.Application.Identity.Exceptions;
using AllJobs.Application.Orders.Exceptions;
using AllJobs.Application.Products.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

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
        LogException(exception);

        var problemDetails = MapException(exception);

        httpContext.Response.StatusCode = problemDetails.Status!.Value;

        await httpContext.Response.WriteAsJsonAsync(
            problemDetails,
            cancellationToken);

        return true;
    }

    private ProblemDetails MapException(Exception exception)
    {
        return exception switch
        {
            DuplicateProductSkuException => new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "Product SKU conflict",
                Detail = "A product with this SKU already exists."
            },

            DuplicateUserEmailException => new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "Email conflict",
                Detail = "A user with this email already exists."
            },

            UserNotFoundException => CreateUserNotFoundProblem(),

            InvalidCredentialsException => new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Invalid credentials",
                Detail = "Invalid email or password."
            },

            OrderProductNotFoundException => new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid product",
                Detail = "A product in the order does not exist."
            },

            InactiveProductException => new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "Product unavailable",
                Detail = "An inactive product cannot be added to an order."
            },

            InsufficientStockException => new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "Insufficient stock",
                Detail = "Insufficient stock for one of the products."
            },

            InvalidOrderStatusTransitionException => new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "Invalid order status transition",
                Detail = "The requested order status transition is not allowed."
            },

            _ => new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Unexpected server error",
                Detail = "An unexpected error occurred."
            }
        };
    }

    private static ProblemDetails CreateUserNotFoundProblem()
    {
        var problemDetails = new ProblemDetails
        {
            Status = StatusCodes.Status404NotFound,
            Title = "User not found",
            Detail = "No user exists with this email."
        };

        problemDetails.Extensions["code"] = "USER_NOT_FOUND";

        return problemDetails;
    }

    private void LogException(Exception exception)
    {
        switch (exception)
        {
            case DuplicateProductSkuException duplicateSkuException:
                _logger.LogWarning(
                    exception,
                    "Duplicate product SKU conflict: {Sku}",
                    duplicateSkuException.Sku);
                break;

            case DuplicateUserEmailException duplicateEmailException:
                _logger.LogWarning(
                    exception,
                    "Duplicate user email: {Email}",
                    duplicateEmailException.Email);
                break;

            case OrderProductNotFoundException productNotFoundException:
                _logger.LogWarning(
                    exception,
                    "Order references missing product: {ProductId}",
                    productNotFoundException.ProductId);
                break;

            case InactiveProductException inactiveProductException:
                _logger.LogWarning(
                    exception,
                    "Order references inactive product: {ProductId}",
                    inactiveProductException.ProductId);
                break;

            case InsufficientStockException insufficientStockException:
                _logger.LogWarning(
                    exception,
                    "Insufficient stock for product: {ProductId}",
                    insufficientStockException.ProductId);
                break;

            case InvalidOrderStatusTransitionException:
            case UserNotFoundException:
            case InvalidCredentialsException:
                _logger.LogWarning(
                    exception,
                    "Handled application exception.");
                break;

            default:
                _logger.LogError(
                    exception,
                    "Unhandled exception occurred.");
                break;
        }
    }
}