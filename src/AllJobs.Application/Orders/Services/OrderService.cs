using AllJobs.Application.Orders.Exceptions;
using AllJobs.Application.Orders.DTOs;
using AllJobs.Application.Orders.Repositories;
using AllJobs.Domain.Orders;

namespace AllJobs.Application.Orders.Services;

public class OrderService : IOrderService
{
    private readonly IOrderRepository _orderRepository;

    public OrderService(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;
    }

    public async Task<int> CreateAsync(CreateOrderRequest request)
    {
        var now = DateTime.UtcNow;

        var order = new Order
        {
            CustomerName = request.CustomerName.Trim(),
            CustomerEmail = request.CustomerEmail.Trim().ToLowerInvariant(),
            Status = OrderStatus.New,
            TotalAmount = 0,
            CreatedAt = now,
            UpdatedAt = now,
            Items = request.Items
                .Select(item => new OrderItem
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity
                })
                .ToList()
        };

        return await _orderRepository.CreateAsync(order);
    }
    public Task<IEnumerable<Order>> GetAllAsync(OrderStatus? status)
    {
        return _orderRepository.GetAllAsync(status);
    }

    public Task<Order?> GetByIdAsync(int id)
    {
        return _orderRepository.GetByIdAsync(id);
    }

    public async Task<bool> UpdateStatusAsync(int id, UpdateOrderStatusRequest request)
    {
        var order = await _orderRepository.GetByIdAsync(id);

        if (order is null)
        {
            return false;
        }

        var isValidTransition =
            order.Status == OrderStatus.New &&
            request.Status is OrderStatus.Paid or OrderStatus.Cancelled;

        if (!isValidTransition)
        {
            throw new InvalidOrderStatusTransitionException();
        }

        var updated = await _orderRepository.UpdateStatusAsync(
            id,
            request.Status);

        if (!updated)
        {
            throw new InvalidOrderStatusTransitionException();
        }

        return true;
    }
}