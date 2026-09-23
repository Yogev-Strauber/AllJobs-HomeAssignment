namespace AllJobs.Application.Orders.Exceptions;

public class InsufficientStockException : Exception
{
    public int ProductId { get; }

    public InsufficientStockException(int productId)
        : base("Insufficient stock for one of the products.")
    {
        ProductId = productId;
    }
}