using AllJobs.Application.Products.DTOs;
using AllJobs.Domain.Products;

namespace AllJobs.Application.Products.Interfaces;

public interface IProductRepository
{
    Task<int> CreateAsync(Product product);
    Task<IEnumerable<Product>> GetAllAsync(ProductFilterRequest filter);
    Task<Product?> GetByIdAsync(int id);
    Task<bool> UpdateAsync(Product product);
    Task<bool> UpdateStatusAsync(int id, ProductStatus status);
}
