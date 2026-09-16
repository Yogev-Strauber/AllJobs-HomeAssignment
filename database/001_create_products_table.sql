USE AllJobsDb;
GO


IF OBJECT_ID(N'dbo.Products', N'U') IS NULL
BEGIN
    CREATE TABLE Products
    (
        Id INT IDENTITY(1,1) PRIMARY KEY,

        Name NVARCHAR(200) NOT NULL,

        Sku NVARCHAR(100) NOT NULL,

        Description NVARCHAR(1000) NULL,

        Price DECIMAL(18,2) NOT NULL,

        StockQuantity INT NOT NULL,

        Status TINYINT NOT NULL,

        CreatedAt DATETIME2 NOT NULL,

        UpdatedAt DATETIME2 NOT NULL,

        CONSTRAINT UQ_Products_Sku UNIQUE (Sku),

        CONSTRAINT CK_Products_Price
            CHECK (Price > 0),

        CONSTRAINT CK_Products_StockQuantity
            CHECK (StockQuantity >= 0),

        CONSTRAINT CK_Products_Status
            CHECK (Status IN (1, 2))
    );
END
GO