namespace AllJobs.Application.Orders.Exceptions;

public class InvalidOrderStatusTransitionException : Exception
{
    public InvalidOrderStatusTransitionException()
        : base("The requested order status transition is not allowed.")
    {
    }
}