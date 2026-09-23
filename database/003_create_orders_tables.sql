USE AllJobsDb;
GO

IF OBJECT_ID(N'dbo.Orders', N'U') IS NULL
BEGIN
    CREATE TABLE Orders
    (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        CustomerName NVARCHAR(200) NOT NULL,
        CustomerEmail NVARCHAR(320) NOT NULL,
        Status TINYINT NOT NULL,
        TotalAmount DECIMAL(18,2) NOT NULL,
        CreatedAt DATETIME2 NOT NULL,
        UpdatedAt DATETIME2 NOT NULL,

        CONSTRAINT CK_Orders_Status
            CHECK (Status IN (1,2,3)),

        CONSTRAINT CK_Orders_TotalAmount
            CHECK (TotalAmount >= 0)
    );
END
GO

IF OBJECT_ID(N'dbo.OrderItems', N'U') IS NULL
BEGIN
    CREATE TABLE OrderItems
    (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        OrderId INT NOT NULL,
        ProductId INT NOT NULL,
        Quantity INT NOT NULL,
        UnitPrice DECIMAL(18,2) NOT NULL,
        LineTotal DECIMAL(18,2) NOT NULL,

        CONSTRAINT FK_OrderItems_Orders
            FOREIGN KEY (OrderId) REFERENCES Orders(Id),

        CONSTRAINT FK_OrderItems_Products
            FOREIGN KEY (ProductId) REFERENCES Products(Id),

        CONSTRAINT CK_OrderItems_Quantity
            CHECK (Quantity > 0),

        CONSTRAINT CK_OrderItems_UnitPrice
            CHECK (UnitPrice > 0),

        CONSTRAINT CK_OrderItems_LineTotal
            CHECK (LineTotal > 0)
    );
END
GO