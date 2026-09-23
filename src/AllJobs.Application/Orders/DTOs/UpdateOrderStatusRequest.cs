using AllJobs.Domain.Orders;

namespace AllJobs.Application.Orders.DTOs;

public class UpdateOrderStatusRequest
{
    public OrderStatus Status { get; set; }
}