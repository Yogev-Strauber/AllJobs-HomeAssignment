USE AllJobsDb;
GO

DECLARE @AdminRole TINYINT = 1;
DECLARE @ViewerRole TINYINT = 2;

IF NOT EXISTS (
    SELECT 1
    FROM Users
    WHERE Email = 'viewer@example.com'
)
BEGIN
    INSERT INTO Users
    (
        Email,
        PasswordHash,
        FirstName,
        LastName,
        Mobile,
        Address,
        Role,
        CreatedAt,
        UpdatedAt
    )
    VALUES
    (
        'viewer@example.com',
        'AQAAAAIAAYagAAAAEMqN2uQnURkob02OF5YM24vONmk9pRqz4Qtk+iwhJ3lEblmMq1wPfUS7mE8nzN9lBA==',
        'Viewer',
        'User',
        '0500000000',
        'Israel',
        @ViewerRole,
        SYSUTCDATETIME(),
        SYSUTCDATETIME()
    );
END;

IF NOT EXISTS (
    SELECT 1
    FROM Users
    WHERE Email = 'admin@example.com'
)
BEGIN
    INSERT INTO Users
    (
        Email,
        PasswordHash,
        FirstName,
        LastName,
        Mobile,
        Address,
        Role,
        CreatedAt,
        UpdatedAt
    )
    VALUES
    (
        'admin@example.com',
        'AQAAAAIAAYagAAAAEJuM76jniI5+Cv0Jq+ztSq8LyRjKjMRTOI2+dXI8YGYoUBkVnjvJcm1rYcTbbuM3qw==',
        'Admin',
        'User',
        '0500000001',
        'Israel',
        @AdminRole,
        SYSUTCDATETIME(),
        SYSUTCDATETIME()
    );
END;

DECLARE @ActiveStatus TINYINT = 1;
DECLARE @InactiveStatus TINYINT = 2;

INSERT INTO Products
(
    Name,
    Sku,
    Description,
    Price,
    StockQuantity,
    Status,
    CreatedAt,
    UpdatedAt
)
SELECT
    seed.Name,
    seed.Sku,
    seed.Description,
    seed.Price,
    seed.StockQuantity,
    seed.Status,
    SYSUTCDATETIME(),
    SYSUTCDATETIME()
FROM
(
    VALUES
        ('Laptop Stand',       'SKU-001', 'Adjustable laptop stand',   129.90, 25, @ActiveStatus),
        ('Wireless Mouse',     'SKU-002', 'Ergonomic wireless mouse',   89.90, 40, @ActiveStatus),
        ('Mechanical Keyboard','SKU-003', 'Mechanical keyboard',       299.90, 15, @ActiveStatus),
        ('USB-C Hub',          'SKU-004', 'Multi-port USB-C hub',       179.90, 10, @ActiveStatus),
        ('Webcam',             'SKU-005', 'Full HD webcam',             219.90,  8, @ActiveStatus),
        ('Headphones',         'SKU-006', 'Over-ear headphones',        249.90, 30, @ActiveStatus),
        ('Desk Lamp',          'SKU-007', 'LED desk lamp',              149.90, 12, @ActiveStatus),
        ('Monitor Arm',        'SKU-008', 'Adjustable monitor arm',     199.90,  5, @ActiveStatus),
        ('Laptop Sleeve',      'SKU-009', 'Protective laptop sleeve',    79.90, 50, @ActiveStatus),
        ('Old USB Cable',      'SKU-010', 'Discontinued USB cable',      29.90,  3, @InactiveStatus)
) AS seed(Name, Sku, Description, Price, StockQuantity, Status)
WHERE NOT EXISTS
(
    SELECT 1
    FROM Products p
    WHERE p.Sku = seed.Sku
);

DECLARE @SeedProductId INT;
DECLARE @SeedUnitPrice DECIMAL(18, 2);
DECLARE @SeedOrderId INT;

SELECT
    @SeedProductId = Id,
    @SeedUnitPrice = Price
FROM Products
WHERE Sku = 'SKU-001';

IF NOT EXISTS
(
    SELECT 1
    FROM Orders
    WHERE CustomerEmail = 'seed-new@example.com'
)
BEGIN
    INSERT INTO Orders
    (
        CustomerName,
        CustomerEmail,
        Status,
        TotalAmount,
        CreatedAt,
        UpdatedAt
    )
    VALUES
    (
        'Seed New Customer',
        'seed-new@example.com',
        1,
        @SeedUnitPrice,
        SYSUTCDATETIME(),
        SYSUTCDATETIME()
    );

    SET @SeedOrderId = SCOPE_IDENTITY();

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
        @SeedOrderId,
        @SeedProductId,
        1,
        @SeedUnitPrice,
        @SeedUnitPrice
    );
END;

SELECT
    @SeedProductId = Id,
    @SeedUnitPrice = Price
FROM Products
WHERE Sku = 'SKU-002';

IF NOT EXISTS
(
    SELECT 1
    FROM Orders
    WHERE CustomerEmail = 'seed-paid@example.com'
)
BEGIN
    INSERT INTO Orders
    (
        CustomerName,
        CustomerEmail,
        Status,
        TotalAmount,
        CreatedAt,
        UpdatedAt
    )
    VALUES
    (
        'Seed Paid Customer',
        'seed-paid@example.com',
        3,
        @SeedUnitPrice * 2,
        SYSUTCDATETIME(),
        SYSUTCDATETIME()
    );

    SET @SeedOrderId = SCOPE_IDENTITY();

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
        @SeedOrderId,
        @SeedProductId,
        2,
        @SeedUnitPrice,
        @SeedUnitPrice * 2
    );
END;

SELECT
    @SeedProductId = Id,
    @SeedUnitPrice = Price
FROM Products
WHERE Sku = 'SKU-003';

IF NOT EXISTS
(
    SELECT 1
    FROM Orders
    WHERE CustomerEmail = 'seed-cancelled@example.com'
)
BEGIN
    INSERT INTO Orders
    (
        CustomerName,
        CustomerEmail,
        Status,
        TotalAmount,
        CreatedAt,
        UpdatedAt
    )
    VALUES
    (
        'Seed Cancelled Customer',
        'seed-cancelled@example.com',
        2,
        @SeedUnitPrice,
        SYSUTCDATETIME(),
        SYSUTCDATETIME()
    );

    SET @SeedOrderId = SCOPE_IDENTITY();

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
        @SeedOrderId,
        @SeedProductId,
        1,
        @SeedUnitPrice,
        @SeedUnitPrice
    );
END;