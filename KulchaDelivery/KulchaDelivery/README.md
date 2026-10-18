# Kulcha Delivery API (.NET 8 + SQL Server)

Amritsari kulcha food-delivery backend: JWT auth, menu, addresses, orders, admin order management.

## Setup
1. Install .NET 8 SDK and SQL Server (or LocalDB / Docker).
2. Edit `appsettings.json`:
   - `ConnectionStrings:DefaultConnection` -> your SQL Server
   - `Jwt:Key` -> a long random secret (32+ chars)
   - `Admin:*` -> your admin login (auto-created on first run)
3. Create the database:
   ```
   dotnet tool install --global dotnet-ef
   dotnet restore
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```
4. Run: `dotnet run` and open `https://localhost:<port>/swagger`

SQL Server via Docker:
```
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=Your_strong_Pass123" -p 1433:1433 -d mcr.microsoft.com/mssql/server:2022-latest
```
Connection string: `Server=localhost,1433;Database=KulchaDeliveryDb;User Id=sa;Password=Your_strong_Pass123;TrustServerCertificate=True;`

## Endpoints
| Method | Route | Access |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | Public |
| GET | /api/menu?category=Kulcha | Public |
| POST/PUT/DELETE | /api/menu | Admin |
| GET/POST/DELETE | /api/addresses | Customer |
| POST | /api/orders | Customer |
| GET | /api/orders/mine, /api/orders/{id} | Customer |
| POST | /api/orders/{id}/cancel | Customer (only while Placed) |
| GET | /api/orders?status=Placed | Admin |
| PUT | /api/orders/{id}/status | Admin |

Order flow: Placed -> Preparing -> OutForDelivery -> Delivered (or Cancelled).
Delivery fee: Rs 30, free for orders >= Rs 299 (configurable).

## Sample order
```json
POST /api/orders
{ "addressId": 1, "paymentMethod": "CashOnDelivery", "notes": "Extra butter",
  "items": [ { "menuItemId": 1, "quantity": 2 }, { "menuItemId": 11, "quantity": 1 } ] }
```
