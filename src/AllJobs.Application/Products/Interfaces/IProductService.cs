using AllJobs.Application.Products.DTOs;

namespace AllJobs.Application.Products.Interfaces;

public interface IProductService
{
    Task<int> CreateAsync(CreateProductRequest request);
}