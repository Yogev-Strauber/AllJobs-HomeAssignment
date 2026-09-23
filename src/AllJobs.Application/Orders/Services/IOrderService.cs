using AllJobs.Application.Orders.DTOs;
using AllJobs.Domain.Orders;

namespace AllJobs.Application.Orders.Services;

public interface IOrderService
{
    Task<int> CreateAsync(CreateOrderRequest request);
    Task<IEnumerable<Order>> GetAllAsync(OrderStatus? status);
    Task<Order?> GetByIdAsync(int id);
    Task<bool> UpdateStatusAsync(
    int id,
    UpdateOrderStatusRequest request);
}