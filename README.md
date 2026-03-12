# KGL Backend

## Stack
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication

## Setup
1. Open terminal in `C:\Users\USER\Desktop\karibu-groceries-ltmd\kgl-backend`
2. Install dependencies:
   - `npm install`
3. Create env file:
   - `copy .env.example .env`
4. Ensure MongoDB is running locally
5. Start server:
   - `npm run dev`

Backend runs on:
- `http://localhost:4000`

Health check:
- `GET /health`

## Environment Variables
- `PORT=4000`
- `MONGODB_URI=mongodb://127.0.0.1:27017/kgl_db`
- `CORS_ORIGIN=*`
- `JWT_SECRET=change_this_to_a_strong_secret`
- `JWT_EXPIRES_IN=7d`

## Authentication
- Login endpoint:
  - `POST /api/auth/login`
- Returns:
  - `user` object
  - `token` (JWT)
- Protected routes require:
  - `Authorization: Bearer <token>`

Default users are seeded automatically on first run:
- Usernames: `manager`, `attendant1`, `attendant2`, `orban`
- Default password for all demo users: `kgl123`

Frontend shortcut (local dev):
- If `kgl-frontend` sits next to `kgl-backend` in the same repo, the backend also serves the frontend.
- Open `http://localhost:4000/` or `http://localhost:4000/pages/login.html`.

## Main API Routes
- `POST /api/auth/login`
- `POST /api/procurements` (manager)
- `GET /api/procurements` (manager, director)
- `POST /api/sales` (manager, agent)
- `GET /api/sales` (manager, agent, director)
- `PATCH /api/sales/:id` (manager)
- `DELETE /api/sales/:id` (manager)
- `POST /api/credit-sales` (manager, agent)
- `GET /api/credit-sales` (manager, agent, director)
- `PATCH /api/credit-sales/:id/payment` (manager, agent)
- `GET /api/stock/by-produce?produceName=...` (manager, agent, director)
- `GET /api/reports/summary` (director)
- `GET /api/reports/stock` (director)
