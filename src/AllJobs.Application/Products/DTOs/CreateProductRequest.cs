namespace AllJobs.Application.Products.DTOs;

public class CreateProductRequest
{
    public required string Name { get; set; }

    public required string Sku { get; set; }

    public string? Description { get; set; }

    public decimal Price { get; set; }

    public int StockQuantity { get; set; }
}