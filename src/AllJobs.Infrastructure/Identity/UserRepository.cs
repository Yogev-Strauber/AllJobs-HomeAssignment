using AllJobs.Application.Identity.Repositories;
using AllJobs.Domain.Identity;
using AllJobs.Infrastructure.Data;
using Dapper;
using AllJobs.Application.Identity.Exceptions;
using Microsoft.Data.SqlClient;

namespace AllJobs.Infrastructure.Identity;

public class UserRepository : IUserRepository
{
    private readonly SqlConnectionFactory _connectionFactory;

    public UserRepository(SqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        const string sql = """
            SELECT
                Id,
                Email,
                PasswordHash,
                FirstName,
                LastName,
                Mobile,
                Address,
                Role,
                CreatedAt,
                UpdatedAt
            FROM Users
            WHERE Email = @Email;
            """;

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QuerySingleOrDefaultAsync<User>(
            sql,
            new { Email = email });
    }

    public async Task<int> CreateAsync(User user)
    {
        const string sql = """
            INSERT INTO Users
                (Email, PasswordHash, FirstName, LastName, Mobile, Address, Role, CreatedAt, UpdatedAt)
            OUTPUT INSERTED.Id
            VALUES
                (@Email, @PasswordHash, @FirstName, @LastName, @Mobile, @Address, @Role, @CreatedAt, @UpdatedAt);
            """;

        using var connection = _connectionFactory.CreateConnection();

        try
        {
            return await connection.QuerySingleAsync<int>(sql, user);
        }
        catch (SqlException ex) when (
            ex.Number is SqlServerErrorNumbers.UniqueIndexViolation
                or SqlServerErrorNumbers.UniqueConstraintViolation)
        {
            throw new DuplicateUserEmailException(user.Email, ex);
        }
    }
}