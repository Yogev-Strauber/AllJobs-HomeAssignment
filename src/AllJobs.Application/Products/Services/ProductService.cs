using AllJobs.Application.Products.DTOs;
using AllJobs.Application.Products.Interfaces;
using AllJobs.Domain.Products;

namespace AllJobs.Application.Products.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;

    public ProductService(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<int> CreateAsync(CreateProductRequest request)
    {
        var now = DateTime.UtcNow;

        var product = new Product
        {
            Name = request.Name,
            Sku = request.Sku,
            Description = request.Description,
            Price = request.Price,
            StockQuantity = request.StockQuantity,
            Status = ProductStatus.Active,
            CreatedAt = now,
            UpdatedAt = now
        };

        return await _productRepository.CreateAsync(product);
    }
}