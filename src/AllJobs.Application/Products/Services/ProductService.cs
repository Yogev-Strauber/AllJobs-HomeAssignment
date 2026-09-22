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
            Name = request.Name.Trim(),
            Sku = request.Sku.Trim(),
            Description = request.Description?.Trim(),
            Price = request.Price,
            StockQuantity = request.StockQuantity,
            Status = ProductStatus.Active,
            CreatedAt = now,
            UpdatedAt = now
        };

        return await _productRepository.CreateAsync(product);
    }

    public async Task<IEnumerable<Product>> GetAllAsync(ProductFilterRequest filter)
    {
        return await _productRepository.GetAllAsync(filter);
    }

    public async Task<Product?> GetByIdAsync(int id)
    {
        return await _productRepository.GetByIdAsync(id);
    }

    public async Task<bool> UpdateAsync(int id, UpdateProductRequest request)
    {
        var product = await _productRepository.GetByIdAsync(id);

        if (product is null)
        {
            return false;
        }

        product.Name = request.Name.Trim();
        product.Sku = request.Sku.Trim();
        product.Description = request.Description?.Trim();
        product.Price = request.Price;
        product.StockQuantity = request.StockQuantity;
        product.UpdatedAt = DateTime.UtcNow;

        return await _productRepository.UpdateAsync(product);
    }

    public async Task<bool> UpdateStatusAsync(
    int id,
    UpdateProductStatusRequest request)
    {
        var product = await _productRepository.GetByIdAsync(id);

        if (product is null)
        {
            return false;
        }

        return await _productRepository.UpdateStatusAsync(
            id,
            request.Status);
    }
}