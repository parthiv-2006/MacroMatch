# 🍽️ MacroMatch

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-brightgreen?style=for-the-badge)](https://macro-match-cyan.vercel.app/)
[![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)

**MacroMatch** is a full-stack MERN meal planning and macro tracking application that helps users manage pantry inventory, generate optimized meal plans using linear programming, track meal history, and visualize nutrition trends.

---

## 📑 Table of Contents

- [🎯 Overview](#-overview)
- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📋 Prerequisites](#-prerequisites)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Environment Variables](#️-environment-variables)
- [📜 Available Scripts](#-available-scripts)
- [🔌 API Reference](#-api-reference)
- [📂 Project Structure](#-project-structure)
- [🌐 Deployment](#-deployment)
- [🔒 Security Notes](#-security-notes)
- [🐛 Troubleshooting](#-troubleshooting)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [📧 Contact](#-contact)

---

## 🎯 Overview

MacroMatch solves the problem of meal planning by combining pantry management with intelligent meal generation:

- **Smart Pantry Management** — Track your ingredients, set low-stock thresholds, and get alerts when items run low
- **Macro-Optimized Meal Plans** — Uses linear programming (LP solver) to generate meals that hit your protein, carbs, and fat targets
- **Flavor Profile Matching** — Choose between savory, sweet, or neutral meal preferences
- **Analytics Dashboard** — Visualize your nutrition trends over 7 or 30 days with interactive charts
- **Recipe Management** — Save generated meals as recipes and cook them later (automatically deducts from pantry)

---

## ✨ Features

| Category | Features |
|----------|----------|
| 🔐 **Authentication** | JWT-based auth, bcrypt password hashing, protected routes |
| 📦 **Pantry Management** | CRUD operations, low-stock alerts, custom thresholds, consumption tracking |
| 🧮 **Meal Generator** | Macro-target optimization, flavor profiles, reverse shopping list |
| 📊 **Analytics** | 7/30-day macro trends, pantry distribution charts, peak protein tracking |
| 📖 **Recipes** | Save, rename, delete, cook (auto-consumes pantry items) |
| 📜 **History** | Meal logs with timestamps, delete entries, save meal as recipe |
| 🎨 **UX/UI** | Dark theme, custom modals, toast notifications, loading screens, responsive design |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI library |
| React Router 7 | Client-side routing |
| Tailwind CSS 4 | Utility-first styling |
| Recharts | Data visualization |
| Axios | HTTP client |
| React Toastify | Toast notifications |
| Vite 7 | Build tool & dev server |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime environment |
| Express 5 | Web framework |
| MongoDB | NoSQL database |
| Mongoose 9 | ODM for MongoDB |
| JSON Web Tokens | Authentication |
| bcryptjs | Password hashing |
| javascript-lp-solver | Linear programming for meal optimization |

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v16.0.0 or higher ([Download](https://nodejs.org/))
- **npm** v8.0.0 or higher (comes with Node.js)
- **MongoDB** — Local installation or [MongoDB Atlas](https://www.mongodb.com/atlas) account
- **Git** — For cloning the repository

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/parthiv-2006/MacroMatch.git
cd MacroMatch
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Seed the database with initial ingredients (optional but recommended):

```bash
npm run seed
```

Start the backend server:

```bash
npm run dev
```

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Start the frontend development server:

```bash
npm run dev
```

### 4. Access the Application

Open your browser and navigate to: **http://localhost:5173**

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | `3000` |
| `MONGO_URI` | MongoDB connection string | ✅ Yes | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `JWT_SECRET` | Secret key for JWT signing | ✅ Yes | `your-256-bit-secret` |
| `NODE_ENV` | Environment mode | No | `development` or `production` |
| `FRONTEND_URL` | Frontend URL for CORS | No | `https://your-frontend.vercel.app` |

### Frontend (`frontend/.env`)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_API_BASE_URL` | Backend API URL | ✅ Yes | `https://your-backend.onrender.com` |

---

## 📜 Available Scripts

### Backend

| Script | Command | Description |
|--------|---------|-------------|
| Start | `npm start` | Run production server |
| Dev | `npm run dev` | Run with nodemon (hot reload) |
| Seed | `npm run seed` | Seed database with ingredients |

### Frontend

| Script | Command | Description |
|--------|---------|-------------|
| Dev | `npm run dev` | Start Vite dev server |
| Build | `npm run build` | Build for production |
| Preview | `npm run preview` | Preview production build |
| Lint | `npm run lint` | Run ESLint |

---

## 🔌 API Reference

Base URL: `https://your-backend-url.com/api`

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/user` | Register new user | ❌ |
| POST | `/user/login` | Login user | ❌ |

### Pantry

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/pantry` | Get all pantry items | ✅ |
| POST | `/pantry` | Add pantry item | ✅ |
| PUT | `/pantry/:id` | Update pantry item | ✅ |
| DELETE | `/pantry/:id` | Delete pantry item | ✅ |
| GET | `/pantry/low-stock` | Get low stock items | ✅ |
| POST | `/pantry/consume` | Consume pantry items | ✅ |
| GET | `/pantry/history` | Get meal history | ✅ |
| DELETE | `/pantry/history/:id` | Delete meal log | ✅ |

### Meal Generator

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/generate` | Generate optimized meal | ✅ |
| POST | `/generate/reverse` | Reverse shopping list | ✅ |

### Recipes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/recipes` | Get all recipes | ✅ |
| POST | `/recipes` | Create recipe | ✅ |
| PUT | `/recipes/:id` | Update recipe name | ✅ |
| DELETE | `/recipes/:id` | Delete recipe | ✅ |

### Ingredients

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/ingredients` | Get all ingredients | ✅ |
| POST | `/ingredients` | Create custom ingredient | ✅ |

---

## 📂 Project Structure

```
MacroMatch/
├── 📁 backend/
│   ├── 📁 controllers/       # Route handlers
│   │   ├── ingredientController.js
│   │   ├── pantryController.js
│   │   ├── recipeController.js
│   │   ├── solverController.js
│   │   └── userController.js
│   ├── 📁 middleware/        # Express middleware
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── 📁 models/            # Mongoose schemas
│   │   ├── Ingredient.js
│   │   ├── MealLog.js
│   │   ├── PantryItem.js
│   │   ├── Recipe.js
│   │   └── User.js
│   ├── 📁 routes/            # API routes
│   │   ├── ingredientRoutes.js
│   │   ├── pantryRoutes.js
│   │   ├── recipeRoutes.js
│   │   ├── solverRoutes.js
│   │   └── userRoutes.js
│   ├── 📁 utils/             # Utility functions
│   │   └── macroSolver.js    # LP solver logic
│   ├── .env                  # Environment variables
│   ├── package.json
│   ├── seedIngredients.js    # Database seeder
│   └── server.js             # Entry point
│
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 components/    # Reusable UI components
│   │   │   ├── AddItemForm.jsx
│   │   │   ├── AppShell.jsx
│   │   │   ├── ConfirmModal.jsx
│   │   │   ├── LoadingScreen.jsx
│   │   │   ├── PantryList.jsx
│   │   │   ├── PromptModal.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── ValidationError.jsx
│   │   ├── 📁 context/       # React context providers
│   │   │   └── AuthContext.jsx
│   │   ├── 📁 pages/         # Page components
│   │   │   ├── AnalyticsDashboard.jsx
│   │   │   ├── CreateIngredient.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── GeneratorPage.jsx
│   │   │   ├── History.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Recipes.jsx
│   │   │   └── Register.jsx
│   │   ├── 📁 services/      # API service functions
│   │   │   ├── authServices.js
│   │   │   ├── ingredientServices.js
│   │   │   ├── pantryServices.js
│   │   │   ├── recipeServices.js
│   │   │   └── solverServices.js
│   │   ├── App.jsx           # Main app component
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx          # Entry point
│   ├── .env                  # Environment variables
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── README.md
```

---

## 🌐 Deployment

### Live Application

🔗 **Frontend:** [https://macro-match-cyan.vercel.app/](https://macro-match-cyan.vercel.app/)

<!-- 🔗 **Backend API:** [YOUR_BACKEND_URL_HERE] -->

### Deploy Your Own

#### Frontend (Vercel)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set root directory to `frontend`
4. Add environment variable: `VITE_API_BASE_URL=https://your-backend-url.com`
5. Deploy!

#### Backend (Render)

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Set root directory to `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://your-frontend.vercel.app`
7. Deploy!

---

## 🔒 Security Notes

- ⚠️ **Never commit `.env` files** — They are in `.gitignore`
- 🔐 **JWT Secret** — Use a strong, random 256-bit secret in production
- 🛡️ **CORS** — Configured to only allow requests from `FRONTEND_URL` in production
- 🔑 **Passwords** — Hashed using bcrypt with salt rounds
- 🚫 **Error Stack Traces** — Hidden in production mode

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| MongoDB connection failed | Check `MONGO_URI` and network access in Atlas |
| CORS errors in production | Ensure `FRONTEND_URL` is set correctly in backend |
| JWT token invalid | Check `JWT_SECRET` matches between environments |
| API calls fail in production | Verify `VITE_API_BASE_URL` is set in frontend |
| Vite proxy not working | Proxy only works in dev; use env variable for production |

### Debug Mode

Set `NODE_ENV=development` to see detailed error stack traces.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- ### Code Style

- Follow ESLint configuration
- Use meaningful commit messages
- Write comments for complex logic -->

---

## 📄 License

This project is licensed under the **ISC License** — see the [LICENSE](LICENSE) file for details.

---

## 📧 Contact

**Parthiv Paul** — Developer

- 💼 LinkedIn: [Parthiv Paul](https://www.linkedin.com/in/parthiv-paul)
- 📧 Email: [parthiv.paul5545@gmail.com](mailto:parthiv.paul5545@gmail.com)
- 🐙 GitHub: [@parthiv-2006](https://github.com/parthiv-2006)

---

<div align="center">

**⭐ Star this repo if you found it helpful!**

Made with ❤️ by Parthiv Paul

</div>
