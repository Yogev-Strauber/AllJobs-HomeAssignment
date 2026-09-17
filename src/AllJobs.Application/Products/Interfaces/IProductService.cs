using AllJobs.Application.Products.DTOs;
using AllJobs.Domain.Products;

namespace AllJobs.Application.Products.Interfaces;

public interface IProductService
{
    Task<int> CreateAsync(CreateProductRequest request);
    Task<IEnumerable<Product>> GetAllAsync();
    Task<Product?> GetByIdAsync(int id);
}