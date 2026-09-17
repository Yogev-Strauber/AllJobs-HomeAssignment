using AllJobs.Domain.Products;

namespace AllJobs.Application.Products.DTOs;

public class UpdateProductStatusRequest
{
    public ProductStatus Status { get; set; }
}