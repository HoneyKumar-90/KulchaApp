# 🫓 Kulcha Delivery

A full-stack food delivery app for Amritsari kulcha: a React Native mobile app for customers and an ASP.NET Core 8 REST API with SQL Server, JWT authentication and admin order management.

![React Native](https://img.shields.io/badge/React_Native-Expo-blue)
![.NET](https://img.shields.io/badge/.NET-8-512BD4)
![SQL Server](https://img.shields.io/badge/SQL_Server-EF_Core-CC2927)
![Auth](https://img.shields.io/badge/Auth-JWT-orange)

## Features

**Customer app (React Native)**
- Register and login with JWT (session is remembered on the device)
- Browse the menu by category: Kulcha, Combo, Side, Beverage, Dessert
- Cart with quantity controls, delivery fee and a free-delivery hint
- Checkout with saved delivery addresses and payment method selection
- Order tracking: Placed → Preparing → Out for delivery → Delivered
- Cancel an order while it is still in the Placed state
- Order status refreshes automatically every 15 seconds

**Backend API (ASP.NET Core 8)**
- JWT authentication with BCrypt password hashing
- Role-based access: Customer and Admin
- Menu management for admins (add, edit, soft-delete)
- Order placement with prices calculated on the server, never trusted from the client
- Configurable delivery fee (free above a set amount)
- Admin order list with status filter and status updates
- Swagger UI with JWT support
- Entity Framework Core migrations with seeded menu data

## Tech stack

| Layer | Technology |
|---|---|
| Mobile app | React Native, Expo, React Navigation |
| API | ASP.NET Core 8 Web API |
| Database | SQL Server, Entity Framework Core |
| Auth | JWT Bearer, BCrypt |
| API docs | Swagger / OpenAPI |

## Project structure

```
KulchaDelivery/KulchaDelivery   -> ASP.NET Core API
  Controllers/   Auth, Menu, Addresses, Orders
  Models/        Entities and DTOs
  Data/          DbContext and seed data
  Services/      JWT token service
  Migrations/    EF Core migrations

KulchaApp/KulchaApp             -> React Native (Expo) app
  src/screens/   Auth, Menu, Cart, Checkout, Orders, Profile
  src/           API client, auth and cart state, config
```

## Getting started

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- SQL Server (Express or LocalDB is fine)
- [Node.js](https://nodejs.org) (LTS)
- The **Expo Go** app on your phone

### 1. Run the API

```bash
cd KulchaDelivery/KulchaDelivery
dotnet restore
```

Create `appsettings.Development.json` in this folder with your own settings (this file is git-ignored, so your secrets stay private):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=KulchaDeliveryDb;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Key": "USE_A_RANDOM_SECRET_OF_AT_LEAST_32_CHARACTERS"
  },
  "Admin": {
    "Email": "admin@kulcha.local",
    "Password": "YOUR_ADMIN_PASSWORD",
    "Phone": "9999999999"
  }
}
```

Then start the API. The database, tables, menu items and admin user are created automatically on first run:

```bash
dotnet run --urls "http://0.0.0.0:5000"
```

Open `http://localhost:5000/swagger` to explore the API.

### 2. Run the mobile app

```bash
cd KulchaApp/KulchaApp
npm install
npx expo install --fix
```

Open `src/config.js` and set `API_URL` to your PC's local IP address:

```js
export const API_URL = 'http://YOUR_PC_IP:5000';
```

Find your IP with `ipconfig` (Windows) and use the IPv4 address of your Wi-Fi adapter. Then start the app and scan the QR code with Expo Go. Your phone and PC must be on the same Wi-Fi network.

```bash
npx expo start
```

> If your phone cannot reach the API, allow port 5000 through the Windows Firewall.

### 3. Build an APK

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

## API overview

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | Public |
| GET | `/api/menu` | Public |
| POST / PUT / DELETE | `/api/menu` | Admin |
| GET / POST / DELETE | `/api/addresses` | Customer |
| POST | `/api/orders` | Customer |
| GET | `/api/orders/mine`, `/api/orders/{id}` | Customer |
| POST | `/api/orders/{id}/cancel` | Customer |
| GET | `/api/orders` | Admin |
| PUT | `/api/orders/{id}/status` | Admin |

## Roadmap

- Online payments (Razorpay / UPI)
- Delivery partner app with live order assignment
- Push notifications for order status changes
- Admin dashboard (web or mobile)
- Delivery area check by pincode

## Author

**Honey Kumar**: [GitHub](https://github.com/HoneyKumar-90)
