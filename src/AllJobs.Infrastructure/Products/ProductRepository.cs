using AllJobs.Application.Products.DTOs;
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

    public async Task<IEnumerable<Product>> GetAllAsync(ProductFilterRequest filter)
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
        WHERE
            (@Search IS NULL
                OR Name LIKE '%' + @Search + '%'
                OR Sku LIKE '%' + @Search + '%')
            AND (@Status IS NULL OR Status = @Status)
        ORDER BY Id;
        """;

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<Product>(
            sql,
            new
            {
                Search = string.IsNullOrWhiteSpace(filter.Search)
                    ? null
                    : filter.Search.Trim(),
                Status = filter.Status
            });
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

    public async Task<bool> UpdateAsync(Product product)
    {
        const string sql = """
        UPDATE Products
        SET
            Name = @Name,
            Sku = @Sku,
            Description = @Description,
            Price = @Price,
            StockQuantity = @StockQuantity,
            UpdatedAt = @UpdatedAt
        WHERE Id = @Id;
        """;

        using var connection = _connectionFactory.CreateConnection();

        var affectedRows = await connection.ExecuteAsync(sql, product);

        return affectedRows > 0;
    }

    public async Task<bool> UpdateStatusAsync(int id, ProductStatus status)
    {
        const string sql = """
        UPDATE Products
        SET
            Status = @Status,
            UpdatedAt = @UpdatedAt
        WHERE Id = @Id;
        """;

        using var connection = _connectionFactory.CreateConnection();

        var affectedRows = await connection.ExecuteAsync(
            sql,
            new
            {
                Id = id,
                Status = status,
                UpdatedAt = DateTime.UtcNow
            });

        return affectedRows > 0;
    }
}