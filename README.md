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

---

## Image Hosting

The application uses direct image URLs (e.g. Amazon product images). No file uploads are stored on the server. Broken image URLs automatically show a placeholder fallback.

---

## Security

- Customer frontend contains **zero** admin routes, components, or code.
- Admin frontend is a completely separate app with its own login and authentication.
- Backend admin APIs require JWT authentication.
- CORS is configured to only allow specific frontend origins.
