# 🛍️ ShopEase — Full Stack E-Commerce Application

A **production-ready** E-Commerce web application built with React.js, Node.js, Express, MySQL, and Stripe payments.

---

## 📁 Project Structure

```
ecommerce-app/
├── database/
│   └── schema.sql              # Complete MySQL schema + seed data
├── backend/
│   ├── config/
│   │   └── db.js               # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js   # Register, Login, Profile
│   │   ├── productController.js# CRUD products + categories
│   │   ├── cartController.js   # Cart operations
│   │   ├── orderController.js  # Order management
│   │   ├── paymentController.js# Stripe integration
│   │   └── adminController.js  # Admin stats & user management
│   ├── middleware/
│   │   ├── auth.js             # JWT protect + adminOnly
│   │   ├── errorHandler.js     # Global error handling
│   │   └── upload.js           # Multer image upload
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── adminRoutes.js
│   ├── uploads/                # Uploaded product images (auto-created)
│   ├── .env.example
│   ├── package.json
│   └── server.js               # Express app entry point
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── api/
    │   │   ├── axios.js         # Configured Axios + interceptors
    │   │   └── services.js      # All API service functions
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Navbar.js
    │   │   │   └── Footer.js
    │   │   └── product/
    │   │       └── ProductCard.js
    │   ├── pages/
    │   │   ├── HomePage.js
    │   │   ├── UserDashboard.js
    │   │   ├── auth/
    │   │   │   ├── LoginPage.js
    │   │   │   └── RegisterPage.js
    │   │   ├── product/
    │   │   │   ├── ProductsPage.js
    │   │   │   └── ProductDetailPage.js
    │   │   ├── cart/
    │   │   │   ├── CartPage.js
    │   │   │   └── CheckoutPage.js
    │   │   ├── order/
    │   │   │   └── OrderSuccessPage.js
    │   │   └── admin/
    │   │       ├── AdminDashboard.js
    │   │       ├── AdminProducts.js
    │   │       ├── AdminOrders.js
    │   │       └── AdminUsers.js
    │   ├── store/
    │   │   ├── index.js         # Redux store
    │   │   ├── authSlice.js     # Auth state
    │   │   └── cartSlice.js     # Cart state
    │   ├── styles/
    │   │   └── index.css        # Tailwind CSS
    │   ├── App.js               # Routes + Protected Routes
    │   └── index.js             # React entry point
    ├── .env.example
    ├── package.json
    └── tailwind.config.js
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18+
- MySQL 8.0+
- A free [Stripe account](https://dashboard.stripe.com)

---

### Step 1 — Database Setup

1. Open MySQL and run:
```sql
SOURCE /path/to/ecommerce-app/database/schema.sql;
```

Or using the CLI:
```bash
mysql -u root -p < database/schema.sql
```

This creates the database, all tables, and seeds sample data including:
- 5 categories
- 8 sample products
- 1 admin user (admin@ecommerce.com / Admin@123)

---

### Step 2 — Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your values:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ecommerce_db
JWT_SECRET=your_long_random_secret_here
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx
FRONTEND_URL=http://localhost:3000
```

Install dependencies and start:
```bash
npm install
npm run dev       # Development (auto-reload)
# or
npm start         # Production
```

Backend runs at: **http://localhost:5000**

---

### Step 3 — Frontend Setup

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxx
```

Install and start:
```bash
npm install
npm start
```

Frontend runs at: **http://localhost:3000**

---

## 🔑 Demo Accounts

| Role  | Email                  | Password  |
|-------|------------------------|-----------|
| Admin | admin@ecommerce.com    | Admin@123 |
| User  | Register a new account | —         |

---

## 💳 Stripe Test Payment

Use these test card numbers in the Stripe checkout:

| Card              | Number              |
|-------------------|---------------------|
| Visa (success)    | 4242 4242 4242 4242 |
| Always declined   | 4000 0000 0000 0002 |

- Expiry: any future date (e.g., 12/34)
- CVC: any 3 digits
- ZIP: any 5 digits

---

## 📡 API Endpoints Reference

### Auth
| Method | Route                  | Auth | Description         |
|--------|------------------------|------|---------------------|
| POST   | /api/auth/register     | No   | Register user       |
| POST   | /api/auth/login        | No   | Login user          |
| GET    | /api/auth/profile      | Yes  | Get own profile     |
| PUT    | /api/auth/profile      | Yes  | Update profile      |

### Products
| Method | Route                  | Auth  | Description         |
|--------|------------------------|-------|---------------------|
| GET    | /api/products          | No    | List + filter + paginate |
| GET    | /api/products/:id      | No    | Get product by ID   |
| GET    | /api/products/categories | No  | List categories     |
| POST   | /api/products          | Admin | Create product      |
| PUT    | /api/products/:id      | Admin | Update product      |
| DELETE | /api/products/:id      | Admin | Soft-delete product |

### Cart
| Method | Route             | Auth | Description         |
|--------|-------------------|------|---------------------|
| GET    | /api/cart         | Yes  | Get user's cart     |
| POST   | /api/cart/add     | Yes  | Add item to cart    |
| PUT    | /api/cart/update  | Yes  | Update quantity     |
| DELETE | /api/cart/remove  | Yes  | Remove item         |
| DELETE | /api/cart/clear   | Yes  | Clear entire cart   |

### Orders
| Method | Route             | Auth | Description         |
|--------|-------------------|------|---------------------|
| POST   | /api/orders       | Yes  | Create order        |
| GET    | /api/orders       | Yes  | My orders           |
| GET    | /api/orders/:id   | Yes  | Order details       |

### Payments
| Method | Route                                   | Auth | Description              |
|--------|-----------------------------------------|------|--------------------------|
| POST   | /api/payment/create-checkout-session    | Yes  | Create Stripe session    |
| GET    | /api/payment/verify/:sessionId          | Yes  | Verify payment success   |
| POST   | /api/payment/webhook                    | No   | Stripe webhook handler   |

### Admin
| Method | Route                        | Auth  | Description             |
|--------|------------------------------|-------|-------------------------|
| GET    | /api/admin/stats             | Admin | Dashboard stats         |
| GET    | /api/admin/users             | Admin | All users               |
| PUT    | /api/admin/users/:id/toggle  | Admin | Toggle user active      |
| GET    | /api/admin/orders            | Admin | All orders              |
| PUT    | /api/admin/orders/:id/status | Admin | Update order status     |

---

## 🏗️ Database Schema

| Table       | Purpose                             |
|-------------|-------------------------------------|
| users       | User accounts with bcrypt passwords |
| categories  | Product categories                  |
| products    | Product catalog                     |
| cart        | Shopping cart items per user        |
| orders      | Customer orders with shipping info  |
| order_items | Individual items within each order  |
| payments    | Stripe payment records              |

---

## 🔐 Security Features

- **bcrypt** password hashing (12 rounds)
- **JWT** authentication with expiry
- **Protected routes** on both frontend & backend
- **Admin middleware** for admin-only operations
- **SQL injection prevention** via parameterized queries
- **Stripe webhook signature verification**
- **File upload validation** (type + size)
- **Input validation** via express-validator
- **CORS** configured for frontend URL only

---

## 🌐 Deployment Guide

### Backend (e.g., Railway, Render, DigitalOcean)
1. Set all environment variables in your hosting dashboard
2. Make sure `NODE_ENV=production`
3. Run `npm start`

### Frontend (e.g., Vercel, Netlify)
1. Set `REACT_APP_API_URL` to your backend URL
2. Set `REACT_APP_STRIPE_PUBLISHABLE_KEY`
3. Run `npm run build` — deploy the `build/` folder

### Stripe Webhooks (Production)
1. Go to Stripe Dashboard → Webhooks → Add Endpoint
2. URL: `https://your-api.com/api/payment/webhook`
3. Events: `checkout.session.completed`
4. Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`

---

## 🛠️ Tech Stack

| Layer     | Technology                |
|-----------|---------------------------|
| Frontend  | React 18, Redux Toolkit, React Router v6, Tailwind CSS, Axios |
| Backend   | Node.js, Express.js       |
| Database  | MySQL 8 (mysql2 pool)     |
| Auth      | JWT + bcryptjs            |
| Payments  | Stripe Checkout           |
| File Upload | Multer               |
| Validation | express-validator        |

---

## 📝 Notes

- Product images from URLs (Unsplash) work directly; uploaded images save to `/backend/uploads/`
- Cart is saved in the database (persistent across sessions)
- Orders reduce product stock automatically (transactional)
- Admin password in seed: `Admin@123` — **change in production!**
- For production, use environment-specific JWT secrets (long random strings)
