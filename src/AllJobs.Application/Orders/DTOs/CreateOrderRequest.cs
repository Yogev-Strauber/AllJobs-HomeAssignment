using System.ComponentModel.DataAnnotations;

namespace AllJobs.Application.Orders.DTOs;

public class CreateOrderRequest
{
    private const int CustomerNameMaxLength = 200;
    private const int CustomerEmailMaxLength = 320;

    [Required]
    [MaxLength(CustomerNameMaxLength)]
    public required string CustomerName { get; set; }

    [Required]
    [EmailAddress]
    [MaxLength(CustomerEmailMaxLength)]
    public required string CustomerEmail { get; set; }

    [Required]
    [MinLength(1)]
    public required List<CreateOrderItemRequest> Items { get; set; }
}