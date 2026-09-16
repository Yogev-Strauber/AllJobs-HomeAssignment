using AllJobs.Application.Products.Interfaces;
using AllJobs.Domain.Products;
using AllJobs.Infrastructure.Data;
using Dapper;

namespace AllJobs.Infrastructure.Products;

public class ProductRepository : IProductRepository
{
    private readonly SqlConnectionFactory _connectionFactory;

    public ProductRepository(SqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<int> CreateAsync(Product product)
    {
        const string sql = """
            INSERT INTO Products
                (Name, Sku, Description, Price, StockQuantity, Status, CreatedAt, UpdatedAt)
            OUTPUT INSERTED.Id
            VALUES
                (@Name, @Sku, @Description, @Price, @StockQuantity, @Status, @CreatedAt, @UpdatedAt);
            """;

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QuerySingleAsync<int>(sql, product);
    }
}