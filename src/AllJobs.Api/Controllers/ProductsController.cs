using AllJobs.Application.Products.DTOs;
using AllJobs.Application.Products.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AllJobs.Api.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateProductRequest request)
    {
        var id = await _productService.CreateAsync(request);

        return Created($"/api/products/{id}", new { id });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] ProductFilterRequest filter)
    {
        var products = await _productService.GetAllAsync(filter);

        return Ok(products);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var product = await _productService.GetByIdAsync(id);

        if (product is null)
        {
            return NotFound();
        }

        return Ok(product);
    }
}