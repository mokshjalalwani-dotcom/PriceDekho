# PriceDekho Web App

A full-stack, decoupled e-commerce application.

## Project Structure
The repository is split into three decoupled applications:
* `backend/` - Node.js/Express API (Serves both Customer & Admin apps)
* `customer-frontend/` - React app for public customers (Deployed on Cloudflare Pages)
* `admin-frontend/` - React app for admin dashboard (Deployed on Cloudflare Pages)

## Environment Variables

### Backend (`backend/.env`)
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=https://customer.yourdomain.com
ADMIN_URL=https://admin.yourdomain.com
NODE_ENV=production
```

### Customer Frontend (`customer-frontend/.env`)
```
VITE_API_BASE_URL=https://your-backend-api.onrender.com/api
```

### Admin Frontend (`admin-frontend/.env`)
```
VITE_API_BASE_URL=https://your-backend-api.onrender.com/api
```

## Running Locally

From the root directory:
* Run Backend: `npm run dev:backend` (Runs on `http://localhost:5000`)
* Run Customer Frontend: `npm run dev:customer` (Runs on `http://localhost:5175`)
* Run Admin Frontend: `npm run dev:admin` (Runs on `http://localhost:5176`)

> **Note:** The frontends use `VITE_API_BASE_URL` to connect to the backend API. If you leave it empty locally, it will default to the Vite proxy targeting `http://localhost:5000`.

## Deployment Instructions

### Backend (Render)
1. Connect Render to this GitHub repository.
2. Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Set the required Environment Variables in the Render Dashboard.
6. Verify deployment by visiting `/api/health`.

### Customer Frontend (Cloudflare Pages)
1. Connect Cloudflare Pages to this GitHub repository.
2. Framework preset: `React`
3. Root Directory: `customer-frontend`
4. Build Command: `npm run build`
5. Build Output Directory: `dist`
6. Environment Variables: Set `VITE_API_BASE_URL` to your live Render backend URL.

### Admin Frontend (Cloudflare Pages)
1. Connect Cloudflare Pages to this GitHub repository.
2. Framework preset: `React`
3. Root Directory: `admin-frontend`
4. Build Command: `npm run build`
5. Build Output Directory: `dist`
6. Environment Variables: Set `VITE_API_BASE_URL` to your live Render backend URL.

## Image Hosting
The application stores direct URLs to images rather than storing the files locally. Both the admin portal and customer product pages handle broken image links with a robust fallback system automatically.
