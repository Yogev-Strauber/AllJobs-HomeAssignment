# AllJobs Home Assignment

Full-stack product and order management system built with .NET 10, SQL Server, JWT authentication, role-based authorization, Docker Compose, and a Next.js / React client.

## Quick Start

### Prerequisites

- Git
- Docker Desktop

### 1. Clone the repository

```bash
git clone https://github.com/Yogev-Strauber/AllJobs-HomeAssignment.git
cd AllJobs-HomeAssignment
```

### 2. Create `.env`

Copy the example file:

```powershell
Copy-Item .env.example .env
```

Required variables:

```env
MSSQL_SA_PASSWORD=<strong-password>
JWT_KEY=<jwt-signing-key>
```

Generate a JWT signing key in PowerShell:

```powershell
$bytes = New-Object byte[] 64
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

Paste the generated value into `JWT_KEY`.

> `.env` is excluded from Git.

### 3. Run the application

```bash
docker compose up --build
```

Docker Compose starts SQL Server, initializes the database and seed data, and starts the backend API.

## Service URLs

| Service | URL |
|---|---|
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger/index.html |
| SQL Server | localhost:1433 |

## Test Users

### Admin

```text
Email: admin@example.com
Password: Admin123!
```

### Viewer

```text
Email: viewer@example.com
Password: Viewer123!
```

## Swagger

Open:

```text
http://localhost:8080/swagger/index.html
```

For protected endpoints:

1. Call `POST /api/auth/login`.
2. Copy the returned `accessToken`.
3. Click **Authorize** in Swagger.
4. Paste the raw JWT token.
5. Call protected endpoints.

---

# Backend

## Structure

```text
src/
├── AllJobs.Api
├── AllJobs.Application
├── AllJobs.Domain
└── AllJobs.Infrastructure
```

- `AllJobs.Api` — HTTP endpoints, authentication, authorization, Swagger, dependency injection, global error handling.
- `AllJobs.Application` — business logic, services, DTOs, validation.
- `AllJobs.Domain` — entities and enums.
- `AllJobs.Infrastructure` — Dapper repositories and SQL Server access.

The backend uses explicit parameterized SQL through Dapper. Entity Framework is not used.

## Authentication and Authorization

JWT authentication is used for protected endpoints.

Roles:

- `Admin` — full product and order management.
- `Viewer` — read-only access.

Expected behavior:

```text
No token                     → 401 Unauthorized
Authenticated without access → 403 Forbidden
```

Public registration always creates a `Viewer`.

## Product Rules

- Products are marked Active / Inactive instead of being deleted.
- SKU is unique.
- Price must be positive.
- Stock cannot be negative.
- `StockQuantity = 0` is allowed and represents an out-of-stock product.
- Inactive products cannot be added to new orders.

## Order Rules

- An order must contain at least one item.
- Product price is copied into `OrderItems` when the order is created.
- Order total is calculated on the server.
- Stock is reduced when an order is created.
- Stock is restored when an order is cancelled.
- Order creation is transactional.
- Stock deduction is atomic to protect against concurrent orders.

Allowed status transitions:

```text
New → Paid
New → Cancelled
```

`Paid` and `Cancelled` are terminal states.

---

# Database

Microsoft SQL Server is used as the SQL database.

Main tables:

```text
Users
Products
Orders
OrderItems
```

Database scripts are stored in:

```text
database/
```

and run in filename order:

```text
000_create_database.sql
001_create_products_table.sql
002_create_users_table.sql
003_create_orders_tables.sql
004_seed_data.sql
```

The seed includes:

- Required Admin user
- Required Viewer user
- At least 10 products
- At least 3 orders
- At least one inactive product
- Products with different stock quantities

## Seed Data Assumption

Seeded orders are treated as historical data.

The stock values in seeded products represent the current stock **after** those historical orders were already processed.

Therefore, the seed script inserts the historical orders without deducting stock again.

Runtime order creation still performs normal stock deduction, and runtime cancellation restores stock.

---

# Frontend

Client technology:

```text
Next.js
React
```

Backend authorization remains the source of truth for permissions.

---

# Engineering Assumptions

- SQL Server was chosen as the SQL database.
- Dapper is used because the assignment requires explicit SQL rather than Entity Framework.
- Public registration always creates a `Viewer`.
- Zero stock is valid; negative stock is not.
- Inactive products stay in the database but cannot be added to new orders.
- Only `New → Paid` and `New → Cancelled` transitions are allowed.
- Seeded stock represents the state after seeded historical orders were processed.
- Swagger is intentionally exposed in the Docker environment to make API review and testing easy.
- An unknown login email is returned distinctly so the client can redirect the user to registration, as required by the assignment.
