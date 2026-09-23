using AllJobs.Application.Orders.DTOs;
using AllJobs.Application.Orders.Services;
using AllJobs.Domain.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AllJobs.Domain.Orders;

namespace AllJobs.Api.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> Create(CreateOrderRequest request)
    {
        var id = await _orderService.CreateAsync(request);

        return Created(
            $"/api/orders/{id}",
            new { id });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] OrderStatus? status)
    {
        var orders = await _orderService.GetAllAsync(status);

        return Ok(orders);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var order = await _orderService.GetByIdAsync(id);

        if (order is null)
        {
            return NotFound();
        }

        return Ok(order);
    }

    [HttpPatch("{id:int}/status")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> UpdateStatus(
    int id,
    UpdateOrderStatusRequest request)
    {
        var updated = await _orderService.UpdateStatusAsync(id, request);

        if (!updated)
        {
            return NotFound();
        }

        return NoContent();
    }
}