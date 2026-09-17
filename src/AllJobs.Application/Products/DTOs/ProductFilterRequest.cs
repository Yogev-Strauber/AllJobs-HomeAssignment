using AllJobs.Domain.Products;

namespace AllJobs.Application.Products.DTOs;

public class ProductFilterRequest
{
    public string? Search { get; set; }
    public ProductStatus? Status { get; set; }
}