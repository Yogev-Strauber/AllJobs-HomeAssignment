using AllJobs.Application.Orders.Repositories;
using AllJobs.Domain.Orders;
using AllJobs.Domain.Products;
using AllJobs.Infrastructure.Data;
using Dapper;
using AllJobs.Application.Orders.Exceptions;

namespace AllJobs.Infrastructure.Orders;

public class OrderRepository : IOrderRepository
{
    private readonly SqlConnectionFactory _connectionFactory;

    public OrderRepository(SqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<int> CreateAsync(Order order)
    {
        using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        await using var transaction = await connection.BeginTransactionAsync();

        try
        {
            decimal totalAmount = 0;

            foreach (var item in order.Items)
            {
                const string updateStockSql = """
                UPDATE Products
                SET
                    StockQuantity = StockQuantity - @Quantity,
                    UpdatedAt = @UpdatedAt
                OUTPUT INSERTED.Price
                WHERE Id = @ProductId
                  AND Status = @ActiveStatus
                  AND StockQuantity >= @Quantity;
                """;

                var unitPrice =
                    await connection.QuerySingleOrDefaultAsync<decimal?>(
                        updateStockSql,
                        new
                        {
                            item.ProductId,
                            item.Quantity,
                            UpdatedAt = DateTime.UtcNow,
                            ActiveStatus = ProductStatus.Active
                        },
                        transaction);

                if (unitPrice is null)
                {
                    const string productStateSql = """
                    SELECT
                        Status,
                        StockQuantity
                    FROM Products
                    WHERE Id = @ProductId;
                    """;

                    var productState =
                        await connection.QuerySingleOrDefaultAsync<ProductStockState>(
                            productStateSql,
                            new { item.ProductId },
                            transaction);

                    if (productState is null)
                    {
                        throw new OrderProductNotFoundException(item.ProductId);
                    }

                    if (productState.Status != ProductStatus.Active)
                    {
                        throw new InactiveProductException(item.ProductId);
                    }

                    throw new InsufficientStockException(item.ProductId);
                }

                item.UnitPrice = unitPrice.Value;
                item.LineTotal = item.UnitPrice * item.Quantity;

                totalAmount += item.LineTotal;
            }

            order.TotalAmount = totalAmount;

            const string insertOrderSql = """
            INSERT INTO Orders
                (
                    CustomerName,
                    CustomerEmail,
                    Status,
                    TotalAmount,
                    CreatedAt,
                    UpdatedAt
                )
            OUTPUT INSERTED.Id
            VALUES
                (
                    @CustomerName,
                    @CustomerEmail,
                    @Status,
                    @TotalAmount,
                    @CreatedAt,
                    @UpdatedAt
                );
            """;

            order.Id = await connection.QuerySingleAsync<int>(
                insertOrderSql,
                order,
                transaction);

            const string insertItemSql = """
            INSERT INTO OrderItems
                (
                    OrderId,
                    ProductId,
                    Quantity,
                    UnitPrice,
                    LineTotal
                )
            VALUES
                (
                    @OrderId,
                    @ProductId,
                    @Quantity,
                    @UnitPrice,
                    @LineTotal
                );
            """;

            foreach (var item in order.Items)
            {
                item.OrderId = order.Id;

                await connection.ExecuteAsync(
                    insertItemSql,
                    item,
                    transaction);
            }

            await transaction.CommitAsync();

            return order.Id;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
    public async Task<IEnumerable<Order>> GetAllAsync(OrderStatus? status)
    {
        const string sql = """
        SELECT
            Id,
            CustomerName,
            CustomerEmail,
            Status,
            TotalAmount,
            CreatedAt,
            UpdatedAt
        FROM Orders
        WHERE @Status IS NULL OR Status = @Status
        ORDER BY CreatedAt DESC;
        """;

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<Order>(
            sql,
            new { Status = status });
    }

    public async Task<Order?> GetByIdAsync(int id)
    {
        const string orderSql = """
        SELECT
            Id,
            CustomerName,
            CustomerEmail,
            Status,
            TotalAmount,
            CreatedAt,
            UpdatedAt
        FROM Orders
        WHERE Id = @Id;
        """;

        const string itemsSql = """
        SELECT
            Id,
            OrderId,
            ProductId,
            Quantity,
            UnitPrice,
            LineTotal
        FROM OrderItems
        WHERE OrderId = @OrderId
        ORDER BY Id;
        """;

        using var connection = _connectionFactory.CreateConnection();

        var order = await connection.QuerySingleOrDefaultAsync<Order>(
            orderSql,
            new { Id = id });

        if (order is null)
        {
            return null;
        }

        var items = await connection.QueryAsync<OrderItem>(
            itemsSql,
            new { OrderId = id });

        order.Items = items.ToList();

        return order;
    }

    public async Task<bool> UpdateStatusAsync(
        int id,
        OrderStatus status)
    {
        using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        await using var transaction = await connection.BeginTransactionAsync();

        try
        {
            const string updateStatusSql = """
            UPDATE Orders
            SET
                Status = @Status,
                UpdatedAt = @UpdatedAt
            WHERE Id = @Id
              AND Status = @CurrentStatus;
            """;

            var affectedRows = await connection.ExecuteAsync(
                updateStatusSql,
                new
                {
                    Id = id,
                    Status = status,
                    UpdatedAt = DateTime.UtcNow,
                    CurrentStatus = OrderStatus.New
                },
                transaction);

            if (affectedRows == 0)
            {
                await transaction.RollbackAsync();
                return false;
            }

            if (status == OrderStatus.Cancelled)
            {
                const string restoreStockSql = """
                UPDATE p
                SET
                    p.StockQuantity = p.StockQuantity + oi.Quantity,
                    p.UpdatedAt = @UpdatedAt
                FROM Products p
                INNER JOIN OrderItems oi
                    ON oi.ProductId = p.Id
                WHERE oi.OrderId = @OrderId;
                """;

                await connection.ExecuteAsync(
                    restoreStockSql,
                    new
                    {
                        OrderId = id,
                        UpdatedAt = DateTime.UtcNow
                    },
                    transaction);
            }

            await transaction.CommitAsync();

            return true;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
    private sealed class ProductStockState
    {
        public ProductStatus Status { get; set; }
        public int StockQuantity { get; set; }
    }
}
