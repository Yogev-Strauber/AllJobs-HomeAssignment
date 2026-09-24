# AllJobs Home Assignment

Full-stack product and order management system built with .NET 10, SQL Server, JWT authentication, role-based authorization, Docker Compose, and a Next.js / React client.

## Quick Start

### Prerequisites

- Git
- Docker Desktop with Docker Compose enabled
- Docker Desktop running before starting the application

### 1. Clone the repository

```bash
git clone https://github.com/Yogev-Strauber/AllJobs-HomeAssignment.git
cd AllJobs-HomeAssignment
```

### 2. Create `.env`

Create the `.env` file using **one** of the following methods only.

#### Option 1 — PowerShell

```powershell
Copy-Item .env.example .env
```

#### Option 2 — Command Prompt

```cmd
copy .env.example .env
```

#### Option 3 — macOS / Linux / Git Bash

```bash
cp .env.example .env
```

#### Option 4 — Manual creation

Create a file named `.env` in the project root with the following content:

```env
MSSQL_SA_PASSWORD=AllJobsLocal123!
JWT_KEY=AllJobsLocalDevelopmentJwtKey_2026_ChangeMe_1234567890!
```

**Use only one of the options above.**
Each option creates the required .env file,
and once .env.example has been copied to .env (or created manually with the same values),
the project is ready to run locally.

> `.env` is excluded from Git.

### 3. Run the application

```bash
docker compose up --build
```


Docker Compose starts SQL Server, initializes the database and seed data, and starts the backend API.
The frontend is also built and started by Compose.

## Service URLs

| Service | URL |
|---|---|
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger/index.html |
| Frontend | http://localhost:3000 |
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

Client technologies:

```text
Next.js
React
TypeScript
```

Backend authorization remains the source of truth for permissions.

The frontend lives in `client/` and uses the Next.js App Router. It provides login and registration, role-aware product and order management, and the Admin-only order creation workflow. Browser requests use relative `/api/...` paths; Next.js proxies them server-side to `BACKEND_API_URL` so the Docker-only `api` hostname is never exposed to browser code.

For local development, create `client/.env.local`:

```env
BACKEND_API_URL=http://localhost:8080
```

When running with Docker Compose, the frontend service sets:

```env
BACKEND_API_URL=http://api:8080
```

Start the complete application with:

```bash
docker compose up --build
```

Then open `http://localhost:3000`.

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


## Future Improvements

All required core functionality is implemented.

With additional development time, I would focus on the following improvements:
- Automated unit and integration tests.
- Additional frontend UX polish and edge-case handling.
- Optional bonus features such as pagination, inventory reporting, and Admin user management.