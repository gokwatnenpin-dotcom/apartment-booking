# Zestay — Apartment booking platform

A full-stack apartment booking platform built around the Zestay Brand & Build Blueprint in `Zestay_Brand_and_Build_Blueprint.pdf`.

---

## 🛠 Tech Stack

- **Frontend (`client/`):** React 18, Vite, React Router v6, Tailwind CSS, Axios, React Hot Toast
- **Backend (`server/`):** Node.js, Express, PostgreSQL, Prisma ORM, JWT, bcryptjs, Helmet, Morgan, Express Rate Limit
- **Root:** npm monorepo with `concurrently` for running client & server simultaneously

## Product and visual direction

Zestay is the calm, no-nonsense way to book an apartment. The interface uses a warm Sand background, Ink text, Stone borders and one Terracotta action colour. Manrope is used for headings and Inter for body text. Gradients, decorative interface emoji and unnecessary shadows are excluded. The booking flow shows the nightly price calculation before the guest reserves.

---

## 📁 Repository Structure

```text
zestay/
├── package.json          # Root orchestration (concurrently)
├── .gitignore
├── README.md
├── render.yaml           # Render blueprint (Web Service + Postgres DB)
├── client/               # React + Vite frontend
│   ├── .env
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vercel.json       # SPA rewrite rule for React Router
│   ├── vite.config.js
│   └── src/
│       ├── api/          # Axios instance with auth interceptor
│       ├── components/   # Navbar, Footer, Cards, Modals, Spinners
│       ├── context/      # AuthContext (login, register, token rehydration)
│       ├── pages/        # Home, Apartments, ApartmentDetail, Login, Register, MyBookings, AdminDashboard
│       ├── App.jsx
│       ├── index.css
│       └── main.jsx
└── server/               # Express REST API backend
    ├── .env
    ├── .env.example
    ├── package.json
    ├── prisma/
    │   ├── schema.prisma # PostgreSQL Prisma schema
    │   └── seed.js       # Database seeder (Admin + sample apartments)
    └── src/
        ├── controllers/  # Auth, Apartment, and Booking logic
        ├── middleware/   # JWT auth, Admin guard, Rate limit, Validation, Error handler
        ├── routes/       # Auth, Apartment, and Booking routes
        ├── index.js      # Express server entry point & graceful shutdown
        └── prisma.js     # Shared PrismaClient instance
```

---

## 🚀 Step-by-Step Local Setup

### 1. Prerequisites
- **Node.js** v18+ & **npm**
- **PostgreSQL** running locally or via Docker

### 2. Start PostgreSQL via Docker (Quickest)
Run the following command to spin up a PostgreSQL instance with the default database and credentials:

```bash
docker run --name apt-pg -e POSTGRES_PASSWORD=password -e POSTGRES_DB=apartment_booking -p 5432:5432 -d postgres
```

*(Alternatively, ensure your local PostgreSQL server is active and has a database named `apartment_booking`)*

### 3. Install Monorepo Dependencies
From the repository root:

```bash
npm run install:all
```

This installs dependencies in the root, `client`, and `server` folders in one step.

### 4. Configure Environment Variables

**Server (`server/.env`):**
```env
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/apartment_booking"
JWT_SECRET="your_super_secret_jwt_key_change_this_in_production_min_32_chars"
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Client (`client/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
```

*(Both `.env.example` templates are provided and `.env` files are ignored by git).*

### 5. Run Migrations & Generate Prisma Client

```bash
cd server
npx prisma migrate dev --name init
```

### 6. Seed the Database
Populate 60 apartment listings with distinct Unsplash cover photos, three-photo galleries, amenities, and the default demo users. The seed matches existing listings by title and location, so running it again updates them instead of adding duplicates:

```bash
npm run seed
```

#### Demo Credentials:
- **Admin:** `admin@apartmentbooking.com` / `admin123`
- **Customer User:** `user@example.com` / `user123`

### 7. Run the Full Application
Return to the root directory and start both frontend and backend concurrently:

```bash
cd ..
npm run dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔒 Features & Architecture Highlights

### Double-Booking Prevention (Transactional Concurrency)
Double-booking is strictly prevented in `server/src/controllers/bookingController.js` via an atomic Prisma transaction (`prisma.$transaction`). The server verifies date interval overlap (`checkIn < requestedCheckOut AND checkOut > requestedCheckIn`) against all active (`CONFIRMED` / `PENDING`) bookings before creating the record.

### Security & Production Hardening
- **JWT Authentication:** Tokens verified via middleware; user identity attached to `req.user`.
- **CORS Protection:** Configured with whitelist strictly bound to `process.env.CLIENT_URL`.
- **Helmet:** Secure HTTP headers enabled out-of-the-box.
- **Rate Limiting:** Protects API endpoints against brute force attempts.
- **Graceful Shutdown:** Disconnects `PrismaClient` cleanly upon `SIGINT` or `SIGTERM`.

---

## 🌐 Deployment Guide

### 1. Database (Render PostgreSQL / Neon / Supabase)
1. Create a PostgreSQL instance on **Render** (or Neon / Supabase).
2. Copy the connection string:
   - Use the **Internal Database URL** if the server web service is also hosted on Render.
   - Use the **External Database URL** if hosting elsewhere or connecting from local. Note that external connections typically require SSL (`?sslmode=require`).
3. Set this URL as `DATABASE_URL` in your server environment variables.

### 2. Backend Web Service (Render)
You can deploy using the included `render.yaml` blueprint or configure manually:
- **Root Directory:** `server`
- **Build Command:** `npm install && npx prisma migrate deploy`
- **Start Command:** `npm start`
- **Health Check Path:** `/api/health`
- **Environment Variables:**
  - `NODE_ENV`: `production`
  - `PORT`: `5000` (or leave default, Render sets this automatically)
  - `DATABASE_URL`: `[Your PostgreSQL connection string]`
  - `JWT_SECRET`: `[A strong random string, at least 32 characters]`
  - `JWT_EXPIRES_IN`: `7d`
  - `CLIENT_URL`: `https://your-frontend-app.vercel.app` (your Vercel URL)

> ⚠️ **Render Free Tier Note:** Render web services on the free tier spin down after 15 minutes of inactivity. The first request may take 30–60 seconds while the instance boots up. The `/api/health` endpoint can be pinged by uptime monitors if needed.

### 3. Frontend SPA (Vercel)
1. Import the repository in **Vercel**.
2. Configure project settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add Environment Variable:
   - `VITE_API_URL`: `https://your-backend-api.onrender.com/api`
4. The included `client/vercel.json` ensures that client-side React Router paths (e.g. `/apartments/:id`, `/bookings`, `/admin`) reload correctly without 404 errors:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### 4. CORS Setup Summary
- **On Render (Backend):** Set `CLIENT_URL` to your Vercel deployment URL (e.g. `https://your-app.vercel.app`).
- **On Vercel (Frontend):** Set `VITE_API_URL` to your Render API URL including the `/api` prefix (e.g. `https://your-api.onrender.com/api`).
