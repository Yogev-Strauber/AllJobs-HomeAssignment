USE AllJobsDb;
GO

IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
BEGIN
    CREATE TABLE Users
    (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Email NVARCHAR(320) NOT NULL,
        PasswordHash NVARCHAR(500) NOT NULL,
        FirstName NVARCHAR(100) NOT NULL,
        LastName NVARCHAR(100) NOT NULL,
        Mobile NVARCHAR(30) NULL,
        Address NVARCHAR(500) NULL,
        Role TINYINT NOT NULL,
        CreatedAt DATETIME2 NOT NULL,
        UpdatedAt DATETIME2 NOT NULL,

        CONSTRAINT UQ_Users_Email UNIQUE (Email),
        CONSTRAINT CK_Users_Role CHECK (Role IN (1,2))
    );
END
GO