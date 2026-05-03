# 🗂 Team Task Manager

A minimal but complete full-stack task management app with role-based access control.

---

## Tech Stack

| Layer     | Technology          |
|-----------|---------------------|
| Frontend  | React + Vite        |
| Backend   | Node.js + Express   |
| Database  | In-memory (default) |
| Deploy    | Railway + Vercel/Netlify |

---

## Features

- **Auth**: Sign up / Login with email + password. Roles: `admin` or `member`.
- **Role-Based UI**: Admins create tasks; members only see and update their own.
- **Task CRUD**: Create tasks with title, description, assignee, due date. Update status.
- **Dashboard**: Filter by status (all / pending / in-progress / done). Overdue detection.
- **Demo Accounts**: `admin@demo.com / admin123` and `member@demo.com / member123`.

---

## Project Structure

```
team-task-manager/
├── backend/
│   ├── server.js         # Express API (all routes in one file)
│   ├── package.json
│   └── .gitignore
└── frontend/
    ├── src/
    │   ├── App.jsx        # Full React app (single file)
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── .env.example
```

---

## Local Development

### 1. Backend

```bash
cd backend
npm install
node server.js
# Runs on http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env          # VITE_API_URL=http://localhost:4000
npm run dev
# Runs on http://localhost:5173
```

---

## API Reference

| Method | Route        | Auth  | Description              |
|--------|--------------|-------|--------------------------|
| POST   | /signup      | —     | Register a new user       |
| POST   | /login       | —     | Login, returns user object|
| GET    | /tasks       | query | List tasks (role-filtered)|
| POST   | /tasks       | body  | Create task (admin only)  |
| PUT    | /tasks/:id   | body  | Update status/fields      |
| GET    | /users       | —     | List all users (for assign)|

Query params for GET /tasks: `?userId=<id>&role=<admin|member>`

Body params for auth: PUT/POST include `userId` and `role` for authorization.

---

## 🚀 Deployment on Railway (Backend)

### Step 1 — Push Backend to GitHub

```bash
cd backend
git init
git add .
git commit -m "initial backend"
# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USER/ttm-backend.git
git push -u origin main
```

### Step 2 — Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in.
2. Click **New Project → Deploy from GitHub repo**.
3. Select your `ttm-backend` repo.
4. Railway auto-detects Node.js and runs `npm start`.

### Step 3 — Configure Environment Variables (optional)

In Railway dashboard → **Variables**, set:

```
PORT=4000   # Railway injects this automatically anyway
```

### Step 4 — Get Your Public URL

After deploy, go to **Settings → Networking → Generate Domain**.
Copy the URL (e.g., `https://ttm-backend-production.up.railway.app`).

---

## 🚀 Deployment on Vercel (Frontend)

### Step 1 — Push Frontend to GitHub

```bash
cd frontend
git init
git add .
git commit -m "initial frontend"
git remote add origin https://github.com/YOUR_USER/ttm-frontend.git
git push -u origin main
```

### Step 2 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in.
2. Click **Add New → Project → Import** your `ttm-frontend` repo.
3. Framework: **Vite** (auto-detected).
4. Under **Environment Variables**, add:

```
VITE_API_URL = https://YOUR-RAILWAY-URL.up.railway.app
```

5. Click **Deploy**.

### Alternative: Netlify

```bash
cd frontend
npm run build
# Drag-and-drop the dist/ folder at app.netlify.com/drop
# Set env var VITE_API_URL in Site Settings → Environment Variables
```

---

## Notes

- **In-memory data resets** on every server restart. To persist data, swap to MongoDB Atlas:
  1. `npm install mongoose` in backend
  2. Add `MONGO_URI` env var to Railway
  3. Replace the arrays in server.js with Mongoose models
- No JWT is used — user state is stored in `localStorage`. For production, add httpOnly cookies or JWT.
- CORS is open (`*`). In production, set `origin` to your frontend URL.
