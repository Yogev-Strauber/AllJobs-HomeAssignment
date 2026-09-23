using AllJobs.Domain.Orders;

namespace AllJobs.Application.Orders.Repositories;

public interface IOrderRepository
{
    Task<int> CreateAsync(Order order);
    Task<IEnumerable<Order>> GetAllAsync(OrderStatus? status);
    Task<Order?> GetByIdAsync(int id);
    Task<bool> UpdateStatusAsync(int id, OrderStatus status);
}