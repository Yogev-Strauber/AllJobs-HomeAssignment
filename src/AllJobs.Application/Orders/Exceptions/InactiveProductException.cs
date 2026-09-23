namespace AllJobs.Application.Orders.Exceptions;

public class InactiveProductException : Exception
{
    public int ProductId { get; }

    public InactiveProductException(int productId)
        : base("An inactive product cannot be added to an order.")
    {
        ProductId = productId;
    }
}