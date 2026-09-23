using System.ComponentModel.DataAnnotations;

namespace AllJobs.Application.Orders.DTOs;

public class CreateOrderItemRequest
{
    [Range(1, int.MaxValue)]
    public int ProductId { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }
}