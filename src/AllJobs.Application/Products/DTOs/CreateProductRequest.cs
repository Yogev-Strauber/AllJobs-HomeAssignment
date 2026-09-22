using System.ComponentModel.DataAnnotations;

namespace AllJobs.Application.Products.DTOs;

public class CreateProductRequest
{
    [Required]
    [MaxLength(200)]
    public required string Name { get; set; }

    [Required]
    [MaxLength(100)]
    public required string Sku { get; set; }

    [MaxLength(1000)]
    public string? Description { get; set; }

    [Range(0.01, double.MaxValue)]
    public decimal Price { get; set; }

    [Range(0, int.MaxValue)]
    public int StockQuantity { get; set; }
}