# 🛒 Smart Checkout System (Scan & Go)

A production-ready mobile checkout system built with **React Native (Expo)**, **Node.js/Express**, and **PostgreSQL**.

## Architecture

```
Smart Checkout System/
├── backend/             # Node.js + Express API
│   ├── database/        # SQL schema + seed data
│   └── src/
│       ├── config/      # DB connection, env config
│       ├── controllers/ # Business logic
│       ├── middleware/   # Auth, validation, rate-limit, audit
│       ├── models/      # Data access layer
│       ├── routes/      # Express route definitions
│       ├── services/    # Fraud detection
│       └── utils/       # Error classes, validation schemas
└── mobile/              # React Native (Expo) app
    └── src/
        ├── config/      # API base URL
        ├── constants/   # Theme tokens
        ├── context/     # Auth state management
        ├── navigation/  # Stack navigator
        ├── screens/     # 7 app screens
        └── services/    # API client
```

## Prerequisites

- **Node.js** 18+
- **PostgreSQL** 14+
- **Expo CLI** (`npm install -g expo-cli`)
- **Expo Go** app on your phone (or Android/iOS emulator)

## Setup

### 1. Database

```bash
# Create database
psql -U postgres -c "CREATE DATABASE smart_checkout;"

# Run schema + seed
psql -U postgres -d smart_checkout -f backend/database/schema.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env    # Edit DATABASE_URL with your credentials
npm install
npm start               # Runs on http://localhost:3000
```

### 3. Mobile App

```bash
cd mobile
npm install

# Edit src/config/api.js with your backend URL
# - Android emulator: http://10.0.2.2:3000/api
# - iOS simulator: http://localhost:3000/api
# - Physical device: http://YOUR_LOCAL_IP:3000/api

npx expo start
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ✗ | Create account |
| POST | `/api/auth/login` | ✗ | Login |
| POST | `/api/session/start` | ✓ | Start shopping session |
| GET | `/api/session/:id` | ✓ | Get session details |
| GET | `/api/products` | ✓ | List all products |
| GET | `/api/products/barcode/:code` | ✓ | Lookup by barcode |
| POST | `/api/cart/add` | ✓ | Add item to cart |
| POST | `/api/cart/remove` | ✓ | Remove from cart |
| GET | `/api/cart/:sessionId` | ✓ | Get cart contents |
| POST | `/api/payment/pay` | ✓ | Process payment |
| POST | `/api/exit/verify` | ✓ | Verify exit QR |

## Security

- JWT authentication with bcrypt password hashing
- Role-based access control (user/admin)
- Joi input validation on all endpoints
- Rate limiting (100 req/15min general, 20 req/15min auth)
- Helmet secure headers
- Parameterized SQL queries (injection prevention)
- Audit logging for all actions

## Fraud Detection

Automated risk scoring per session:
- Rapid scanning patterns (< 2s intervals)
- Burst scanning (8+ items in 30s)
- High-value cart detection (> ₹5,000)
- Bulk quantity alerts (> 10 of single item)
