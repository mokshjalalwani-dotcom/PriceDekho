# PriceDekho Web App

A full-stack, decoupled e-commerce application for electronics retail.

## Project Structure

```
project/
├── admin-frontend/     → React admin dashboard (Cloudflare Pages)
├── backend/            → Node.js/Express API (Render)
├── customer-frontend/  → React customer storefront (Cloudflare Pages)
├── package.json        → Root monorepo helper scripts
├── sample_data.json    → Seed data for products
└── README.md
```

---

## Running Locally

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### Backend
```bash
cd backend
npm install
npm run dev        # uses nodemon for hot-reload
# or
npm start          # production mode (node server.js)
```
Runs on: `http://localhost:5000`

### Customer Frontend
```bash
cd customer-frontend
npm install
npm run dev
```
Runs on: `http://localhost:5175`

### Admin Frontend
```bash
cd admin-frontend
npm install
npm run dev
```
Runs on: `http://localhost:5176`

### Root Shortcut Scripts
From the project root:
```bash
npm run dev:backend     # Start backend
npm run dev:customer    # Start customer frontend
npm run dev:admin       # Start admin frontend
npm run build:customer  # Build customer frontend
npm run build:admin     # Build admin frontend
```

---

## Environment Variables

### Backend (`backend/.env`)
```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://your_atlas_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=https://pricedekho-customer.pages.dev
ADMIN_URL=https://pricedekho-admin.pages.dev
```

### Customer Frontend
Set as Cloudflare Pages environment variable:
```
VITE_API_BASE_URL=https://pricedekho-1backend.onrender.com/api
```

### Admin Frontend
Set as Cloudflare Pages environment variable:
```
VITE_API_BASE_URL=https://pricedekho-1backend.onrender.com/api
```

---

## Deployment

### Backend — Render (Already Deployed ✅)

- **URL**: https://pricedekho-1backend.onrender.com
- **Health Check**: https://pricedekho-1backend.onrender.com/api/health
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Customer Frontend — Cloudflare Pages

| Field | Value |
|---|---|
| **Project name** | `pricedekho-customer` |
| **Repository** | `mokshjalalwani-dotcom/PriceDekho` |
| **Production branch** | `main` |
| **Root directory** | `customer-frontend` |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Environment variable** | `VITE_API_BASE_URL` = `https://pricedekho-1backend.onrender.com/api` |

### Admin Frontend — Cloudflare Pages

| Field | Value |
|---|---|
| **Project name** | `pricedekho-admin` |
| **Repository** | `mokshjalalwani-dotcom/PriceDekho` |
| **Production branch** | `main` |
| **Root directory** | `admin-frontend` |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Environment variable** | `VITE_API_BASE_URL` = `https://pricedekho-1backend.onrender.com/api` |

### Important Notes
- Do **NOT** use `npm run dev` in Cloudflare. That is for local development only.
- Both frontends include `public/_redirects` with `/* /index.html 200` for SPA routing.
- Both frontends include `.npmrc` with `legacy-peer-deps=true` for clean installs.
- If using Wrangler direct upload instead of Git deploy: `npx wrangler pages deploy dist`

---

## Image Hosting

The application uses direct image URLs (e.g. Amazon product images). No file uploads are stored on the server. Broken image URLs automatically show a placeholder fallback.

---

## Security

- Customer frontend contains **zero** admin routes, components, or code.
- Admin frontend is a completely separate app with its own login and authentication.
- Backend admin APIs require JWT authentication.
- CORS is configured to only allow specific frontend origins.
