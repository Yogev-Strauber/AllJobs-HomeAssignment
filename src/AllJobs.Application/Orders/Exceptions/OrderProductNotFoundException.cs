namespace AllJobs.Application.Orders.Exceptions;

public class OrderProductNotFoundException : Exception
{
    public int ProductId { get; }

    public OrderProductNotFoundException(int productId)
        : base("A product in the order does not exist.")
    {
        ProductId = productId;
    }
}