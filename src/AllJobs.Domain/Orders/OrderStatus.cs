namespace AllJobs.Domain.Orders;

public enum OrderStatus : byte
{
    New = 1,
    Cancelled = 2,
    Paid = 3
}