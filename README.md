# MacroMatch

MacroMatch is a full-stack meal planning and macro tracking application that helps users manage pantry inventory, generate optimized meal plans, track meal history, and visualize nutrition trends.

## Table of Contents
- Overview
- Features
- Tech Stack
- Requirements
- Quick Start
- Environment Variables
- Scripts
- API Summary
- Project Structure
- Deployment
- Security Notes
- Troubleshooting
- License & Contact

## Overview
- Users can register/login, manage pantry items, set low-stock thresholds, and log meal history.
- Meal generator uses linear programming to hit macro targets (protein/carbs/fats) and flavor profiles (savory/sweet/neutral).
- Analytics dashboard shows macro trends and pantry distribution.
- Recipes can be saved, cooked (consuming pantry items), and managed.

## Features
- Authentication: JWT-based, bcrypt-hashed passwords.
- Pantry: CRUD, low-stock alerts, threshold editing, consumption tracking.
- Meal Generator: Macro-target-based plans and reverse shopping lists.
- Analytics: Macro trends (7d/30d), pantry distribution, peak protein day, averages.
- Recipes: Save, update, delete, cook (consumes pantry items).
- History: Meal logs with delete and save-as-recipe.
- UX: Custom validation UI, custom modals with "Don't ask again" opt-out, loading screens, dark theme.

## Tech Stack
**Frontend:** React 19, React Router 7, Tailwind CSS 4, Recharts, Axios, React Toastify, Vite

**Backend:** Node.js, Express, MongoDB, Mongoose, JSON Web Tokens, bcryptjs, javascript-lp-solver

## Requirements
- Node.js v16+ (recommend LTS)
- npm or yarn
- MongoDB (local or Atlas)

## Quick Start
```bash
git clone https://github.com/yourusername/MacroMatch.git
cd MacroMatch

# Backend
cd backend
npm install
cp .env.example .env   # populate values
npm run dev            # or npm start in production

# (Optional) seed ingredients
node seedIngredients.js

# Frontend
cd ../frontend
npm install
npm run dev            # http://localhost:5173
```

## Environment Variables

Backend (`backend/.env`)
```
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:3000
```

## Scripts

Backend
- `npm start` – start server (production)
- `npm run dev` – start with nodemon (development)
- `npm run seed` – seed ingredient data

Frontend
- `npm run dev` – start Vite dev server
- `npm run build` – production build
- `npm run preview` – preview production build

## API Summary

Auth
- POST `/api/user` – register
- POST `/api/user/login` – login

Pantry
- GET `/api/pantry`
- POST `/api/pantry`
- PUT `/api/pantry/:id`
- DELETE `/api/pantry/:id`
- GET `/api/pantry/low-stock`
- POST `/api/pantry/consume`
- GET `/api/pantry/history`
- DELETE `/api/pantry/history/:id`

Ingredients
- GET `/api/ingredients`
- POST `/api/ingredients`
- GET `/api/ingredients/:id`
- PUT `/api/ingredients/:id`
- DELETE `/api/ingredients/:id`

Meal Generator
- POST `/api/generate`
- POST `/api/generate/reverse`

Recipes
- GET `/api/recipes`
- POST `/api/recipes`
- PUT `/api/recipes/:id`
- DELETE `/api/recipes/:id`

## Project Structure
```
MacroMatch/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── seedIngredients.js
│   ├── server.js
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   └── services/
    ├── public/
    ├── vite.config.js
    └── .env.example
```

## Deployment

Backend (Render/Railway/Heroku)
1) Set env vars: `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`, `PORT=3000`.
2) Build/start: `npm install`, `npm start`.
3) Add Procfile (already included for Heroku).

Frontend (Vercel/Netlify)
1) Build: `npm run build`.
2) Deploy `dist/` (Vercel auto-detects Vite; Netlify publish dir `dist`).
3) SPA routing: `vercel.json` and `_redirects` already included.
4) Set `VITE_API_URL` to production backend URL if not using proxy.

## Security Notes
- Do not commit real secrets; use `.env` (templates provided).
- Use strong `JWT_SECRET` (32+ random characters).
- Enable CORS only for your frontend in production (`FRONTEND_URL`).
- Consider adding rate limiting and Helmet for extra hardening.

## Troubleshooting
- CORS errors: confirm `FRONTEND_URL` and `VITE_API_URL` point to correct domains.
- Mongo connection issues: check `MONGO_URI` and Atlas IP allowlist.
- 404 on refresh (frontend): ensure SPA rewrites (`vercel.json` or `_redirects`).
- Build issues: remove `node_modules`, reinstall, ensure Node v16+.

## License & Contact
- License: ISC
- Author: Parthiv Paul
- Contact: https://github.com/yourusername
