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

    public async Task<IEnumerable<Product>> GetAllAsync()
    {
        const string sql = """
        SELECT
            Id,
            Name,
            Sku,
            Description,
            Price,
            StockQuantity,
            Status,
            CreatedAt,
            UpdatedAt
        FROM Products
        ORDER BY Id;
        """;

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<Product>(sql);
    }

    public async Task<Product?> GetByIdAsync(int id)
    {
        const string sql = """
        SELECT
            Id,
            Name,
            Sku,
            Description,
            Price,
            StockQuantity,
            Status,
            CreatedAt,
            UpdatedAt
        FROM Products
        WHERE Id = @Id;
        """;

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QuerySingleOrDefaultAsync<Product>(
            sql,
            new { Id = id }
        );
    }

}