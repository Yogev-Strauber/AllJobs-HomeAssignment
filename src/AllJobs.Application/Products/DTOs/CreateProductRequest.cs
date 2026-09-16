using System.ComponentModel.DataAnnotations;

namespace AllJobs.Application.Products.DTOs;

public class CreateProductRequest
{

    [Required]
    public required string Name { get; set; }

    [Required]
    public required string Sku { get; set; }

    public string? Description { get; set; }

    [Range(0.01, double.MaxValue)]
    public decimal Price { get; set; }

    [Range(0, int.MaxValue)]

    public int StockQuantity { get; set; }
}