# QuickBite — Full-Stack Food Ordering Application

QuickBite is a responsive, full-stack food ordering web application inspired by the usability of modern Indian food delivery platforms, built with **React + Vite + Tailwind CSS**, **Node.js + Express.js**, **Supabase PostgreSQL**, and **Supabase Auth**. It also includes an Android Jetpack Compose companion app (`app/`) that connects to the same QuickBite REST API.

---

## Project Architecture & Folder Structure

```text
QuickBite/
├── backend/                     # Node.js + Express.js REST API
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── config/supabase.js   # Service-role Supabase client (backend only)
│       ├── controllers/         # Category, Product, Profile, Order & Admin logic
│       ├── middleware/          # JWT auth verification, Admin RBAC, validation, errors
│       ├── routes/              # Modular Express routers
│       └── server.js            # Express app & health check
├── frontend/                    # React + Vite + Tailwind CSS web app
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── src/
│       ├── components/          # Reusable Navbar, Footer, FoodCard, VegBadge, etc.
│       ├── contexts/            # AuthContext, CartContext (localStorage), ToastContext
│       ├── lib/                 # Supabase anon client, INR & date formatters
│       ├── pages/               # Customer & Admin pages
│       └── services/api.js      # REST API client
├── database/                    # PostgreSQL schema & seed data
│   ├── schema.sql               # Tables, triggers, indexes, RLS policies, storage bucket
│   └── seed.sql                 # 7 categories + 22 demo/seed food items in INR
└── app/                         # Android Jetpack Compose QuickBite client
```

---

## Key Security & Business Rules Implemented

- **Server-Side Pricing & Availability Checks**: `POST /api/orders` ignores client-supplied prices or totals. It loads current `products` from PostgreSQL, rejects unavailable items, computes `subtotal_inr`, delivery fee (`₹40`, free above `₹499`), 5% GST, and `total_inr` on the server, and stores item name/price snapshots in `order_items`.
- **Supabase Row Level Security (RLS)**: Customers can only read/write their own `profiles`, `addresses`, `orders`, and `order_items`. Role escalation on `profiles.role` is blocked by a PostgreSQL trigger.
- **Server-Side Admin RBAC**: Every `/api/admin/*` and write `/api/products` / `/api/categories` endpoint verifies the Supabase JWT and checks `profiles.role === 'admin'`.
- **Demo Payment Transparency**: Checkout offers **Cash on Delivery (COD)** and clearly labelled **Demo UPI / Demo Card** simulation options. No real payment gateway is charged.

---

## 1. Supabase Setup Instructions

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** in the Supabase Dashboard:
   - Copy and run `database/schema.sql` to create tables (`profiles`, `categories`, `products`, `addresses`, `orders`, `order_items`), triggers, indexes, RLS policies, and the `product-images` storage bucket.
   - Copy and run `database/seed.sql` to populate 7 categories (`Biriyani`, `Pizza`, `Burgers`, `South Indian`, `Chinese`, `Desserts`, `Beverages`) and **22 demo/seed food items** with INR pricing.
3. Go to **Authentication → Providers → Email**:
   - Ensure Email provider is enabled.
   - For rapid local testing, you may optionally disable **Confirm email** under Authentication → Providers → Email (otherwise check your inbox for the confirmation link after registering).
4. Go to **Project Settings → API** and copy:
   - **Project URL** (`SUPABASE_URL` / `VITE_SUPABASE_URL`)
   - **anon public** key (`VITE_SUPABASE_ANON_KEY`)
   - **service_role secret** key (`SUPABASE_SERVICE_ROLE_KEY` — **backend only!**)

---

## 2. Environment Variables

### Backend (`backend/.env`)

Copy `backend/.env.example` to `backend/.env`:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### Frontend (`frontend/.env`)

Copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> **Security Warning**: Never place `SUPABASE_SERVICE_ROLE_KEY` in `frontend/.env` or any client-side code.

---

## 3. Local Installation & Run Commands

Open two terminals from the project root:

### Terminal 1 — Backend API

```bash
cd backend
cp .env.example .env
# Edit backend/.env with your Supabase URL and service_role key
npm install
npm run dev
```

Verify API health: open `http://localhost:5000/api/health`.

### Terminal 2 — Frontend Web App

```bash
cd frontend
cp .env.example .env
# Edit frontend/.env with your Supabase URL and anon key
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 4. Demo Testing Instructions

### Customer Flow
1. Browse categories, search dishes, toggle **Pure Veg Only**, and view dish details on `/menu` and `/food/:id`.
2. Add dishes to the cart and refresh the page — cart items persist via `localStorage`.
3. Click **Sign In** (`/auth`) and register a new customer account.
4. Go to **Checkout** (`/checkout`), enter or select a saved delivery address, choose **Cash on Delivery** or **Demo UPI / Demo Card**, and place the order.
5. Verify the generated `QB-YYYYMMDD-XXXX` order ID on `/order-confirmation/:id` and track status updates on **My Orders** (`/orders`).

### Admin Flow (Promoting an Admin User)
For security, new registrations always default to `role = 'customer'`. To test the Admin Dashboard:

1. Register a user normally in the app (e.g. `admin@quickbite.example`).
2. Run this query in the **Supabase SQL Editor**:
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE email = 'admin@quickbite.example';
   ```
3. Refresh the web app — the **Admin** link (`/admin`) appears in the navigation bar.
4. Test:
   - Viewing KPI overview (Total Orders, Pending Orders, Total Products, Revenue in INR).
   - Adding/editing/deleting food items and uploading dish images to Supabase Storage.
   - Toggling product availability (and verifying unavailable products cannot be ordered at checkout).
   - Managing categories and updating order statuses (`Pending` → `Confirmed` → `Preparing` → `Out for Delivery` → `Delivered` / `Cancelled`).

---

## 5. Deployment Instructions

### Deploy Backend to Render
1. Push this repository to GitHub.
2. In Render, click **New → Web Service** and connect your repository.
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add Environment Variables in Render:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CLIENT_URL` = `https://your-vercel-app.vercel.app` (your deployed Vercel domain; comma-separate multiple origins if needed)
5. Deploy and note the live Render URL (e.g., `https://quickbite-api.onrender.com`).

### Deploy Frontend to Vercel
1. In Vercel, click **Add New → Project** and import the same GitHub repository.
2. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variables in Vercel:
   - `VITE_API_URL` = `https://quickbite-api.onrender.com/api`
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
4. Add a `vercel.json` SPA rewrite in `frontend/` if needed for deep links:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```
5. Update `CLIENT_URL` on Render and **Supabase → Authentication → URL Configuration → Site URL / Redirect URLs** to include your live Vercel URL.

---

## REST API Reference

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | API & Supabase configuration health check |
| `GET` | `/api/categories` | Public | List active cuisine categories |
| `POST/PUT/DELETE` | `/api/categories/:id` | Admin | Manage food categories |
| `GET` | `/api/products` | Public | Search, filter (`category`, `veg`, `search`, `sort`) |
| `GET` | `/api/products/:id` | Public | Single dish details |
| `POST/PUT/DELETE` | `/api/products/:id` | Admin | Create, edit, delete food products |
| `PATCH` | `/api/products/:id/availability` | Admin | Toggle dish availability |
| `GET/PUT` | `/api/profile` | Auth | View and update own profile |
| `GET/POST/PUT/DELETE` | `/api/profile/addresses` | Auth | Manage own saved delivery addresses |
| `POST` | `/api/orders` | Auth | Place order (server-computed INR totals & snapshots) |
| `GET` | `/api/orders/my` | Auth | Customer order history |
| `GET` | `/api/orders/:id` | Auth | Order details (owner or admin) |
| `GET` | `/api/admin/stats` | Admin | Dashboard metrics & status breakdown |
| `GET` | `/api/admin/orders` | Admin | List all customer orders |
| `PATCH` | `/api/admin/orders/:id/status` | Admin | Update order status |
| `POST` | `/api/admin/upload-image` | Admin | Upload dish photo to Supabase Storage |
