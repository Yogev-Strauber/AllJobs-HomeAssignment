namespace AllJobs.Application.Products.Exceptions;

public class DuplicateProductSkuException : Exception
{
    public string Sku { get; }

    public DuplicateProductSkuException(string sku, Exception innerException)
        : base("A product with this SKU already exists.", innerException)
    {
        Sku = sku;
    }
}