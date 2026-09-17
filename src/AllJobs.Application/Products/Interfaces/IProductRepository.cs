using AllJobs.Domain.Products;

namespace AllJobs.Application.Products.Interfaces;

public interface IProductRepository
{
    Task<int> CreateAsync(Product product);
    Task<IEnumerable<Product>> GetAllAsync();
    Task<Product?> GetByIdAsync(int id);
}
