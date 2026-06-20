# MacroMatch

Computes exact ingredient quantities through linear programming to hit precise macro targets, built for users who track protein, carbs, and fats against a real pantry inventory.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-macro--match--cyan.vercel.app-brightgreen?style=for-the-badge)](https://macro-match-cyan.vercel.app/)
[![Backend Tests](https://github.com/parthiv-2006/MacroMatch/actions/workflows/test.yml/badge.svg)](https://github.com/parthiv-2006/MacroMatch/actions/workflows/test.yml)
[![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)

---

## What It Is

Hitting precise macro targets requires knowing not just what to eat but exactly how many grams of each ingredient. MacroMatch takes a user's pantry and a set of macro goals (protein, carbs, fats in grams), runs a constrained LP model against available stock, and returns up to three structurally distinct meal plans that satisfy all targets within a 5g tolerance band. A second mode inverts the problem: it solves against the full ingredient library and produces a shopping list showing exactly what the pantry is missing to hit the same targets.

---

## Screenshots

<table>
<tr>
<td width="50%">
<img src=".github/assets/screenshots/auth-login.png" alt="Login page"/>
<br/>
<sub><b>Login</b> — JWT issued on sign-in gates every API call. The left panel surfaces the three core features for first-time visitors.</sub>
</td>
<td width="50%">
<img src=".github/assets/screenshots/auth-register.png" alt="Register page"/>
<br/>
<sub><b>Register</b> — One-step account creation. Password is bcrypt-hashed before storage; the plaintext value is never persisted.</sub>
</td>
</tr>
<tr>
<td width="50%">
<img src=".github/assets/screenshots/dashboard-pantry.png" alt="Pantry dashboard"/>
<br/>
<sub><b>Pantry Dashboard</b> — Full inventory table with inline quantity and threshold editing. Each row includes a colour-coded macro distribution bar.</sub>
</td>
<td width="50%">
<img src=".github/assets/screenshots/dashboard-low-stock.png" alt="Low-stock alerts panel"/>
<br/>
<sub><b>Low-Stock Alerts</b> — Items below their configured threshold (default 100g) surface here in real time via <code>/api/pantry/low-stock</code>.</sub>
</td>
</tr>
<tr>
<td width="50%">
<img src=".github/assets/screenshots/generator-form.png" alt="Meal generator form"/>
<br/>
<sub><b>Generator Form</b> — Flavor profile toggle, four quick presets (Cutting / Balanced / Bulking / My Goals ÷ 3), and protein/carbs/fats sliders with a live kcal estimate.</sub>
</td>
<td width="50%">
<img src=".github/assets/screenshots/generator-results.png" alt="Meal generator results"/>
<br/>
<sub><b>Generator Results</b> — Up to three LP solutions with randomized cost coefficients. Bookmark icon saves any plan as a named recipe.</sub>
</td>
</tr>
<tr>
<td width="50%">
<img src=".github/assets/screenshots/generator-shopping.png" alt="Shopping list mode"/>
<br/>
<sub><b>Shopping List Mode</b> — Solves against all 85 ingredients, caps each at 400g, then diffs the result against current pantry stock to show exactly what to buy.</sub>
</td>
<td width="50%">
<img src=".github/assets/screenshots/analytics-macro-trends.png" alt="Analytics dashboard"/>
<br/>
<sub><b>Analytics Dashboard</b> — Calorie ring vs. daily target, macro progress bars, three KPI cards, and a 7/30-day area chart built from <code>MealLog.totalMacros</code>.</sub>
</td>
</tr>
<tr>
<td width="50%">
<img src=".github/assets/screenshots/analytics-pantry-distribution.png" alt="Pantry distribution chart"/>
<br/>
<sub><b>Pantry Distribution</b> — Donut chart breaking current stock across 6 categories, computed client-side from the same pantry payload. No extra API call needed.</sub>
</td>
<td width="50%">
<img src=".github/assets/screenshots/history.png" alt="Meal history"/>
<br/>
<sub><b>Meal History</b> — Every consumption event logged with per-ingredient macros computed at write time as <code>amount / servingSize * nutrient</code>. Sorted newest-first, deletable individually.</sub>
</td>
</tr>
<tr>
<td width="50%">
<img src=".github/assets/screenshots/recipes.png" alt="Saved recipes"/>
<br/>
<sub><b>Saved Recipes</b> — Named meal plans in a searchable, sortable grid. Cook Recipe runs the same <code>/api/pantry/consume</code> path as direct consumption.</sub>
</td>
<td width="50%">
<img src=".github/assets/screenshots/create-ingredient.png" alt="Create custom ingredient"/>
<br/>
<sub><b>Custom Ingredient</b> — Add foods not in the shared library. The <code>category</code> and <code>flavor</code> enums are validated at the model layer and control LP solver eligibility.</sub>
</td>
</tr>
<tr>
<td width="50%">
<img src=".github/assets/screenshots/dashboard-mobile-390.png" alt="Mobile view at 390px"/>
<br/>
<sub><b>Mobile (390px)</b> — The two-column pantry layout stacks vertically at narrow widths, keeping the add form and low-stock panel accessible without a separate mobile build.</sub>
</td>
<td width="50%"></td>
</tr>
</table>

---

## Features

- **LP meal generation:** each pantry item maps to an LP variable whose protein, carbs, and fats coefficients are `macro_per_100g / 100`. Constraints enforce a 5g tolerance band on all three macros. The solver runs up to 15 iterations with per-variable costs randomized uniformly in [0.5, 1.5), and duplicate solutions are filtered by a sorted `"ingredient:grams"` canonical signature.
- **Reverse shopping list:** solves against all 85 seeded ingredients (not the user's pantry), caps each variable at 400g, then diffs the solution against current stock to produce a per-item shortfall list.
- **Flavor profile filtering:** ingredients carry a `flavor` enum (`savory`, `sweet`, `neutral`). Savory mode admits savory and neutral items; sweet mode admits sweet and neutral; neutral restricts to neutral only.
- **Quick macro presets:** four one-click presets (Cutting 45P/30C/12F, Balanced 35P/55C/18F, Bulking 45P/80C/25F, and a personalised My Goals / 3 derived from the user's daily targets) pre-fill the generator sliders.
- **Per-user pantry:** a compound MongoDB index on `(user, ingredient)` prevents duplicate entries. Each item carries a configurable low-stock threshold; the `/api/pantry/low-stock` endpoint returns items where `quantity < threshold` without loading the full inventory.
- **Denormalized meal logs:** consumption writes a `MealLog` with per-item macros computed at write time as `amount / servingSize * nutrient`. Analytics queries read directly from `totalMacros` without touching the `Ingredient` collection.
- **Recipe persistence:** any generated plan can be saved with a custom name. Cooking a recipe runs the identical `/api/pantry/consume` path and produces the same `MealLog` entry as direct consumption.
- **Analytics charts:** Recharts `AreaChart` for 7-day and 30-day macro trends; `PieChart` for pantry inventory distribution across 6 categories. A KPI strip shows total calories, average daily protein, and the peak protein day for the selected range.
- **Custom ingredients:** users can create private ingredients with custom macro values, serving sizes, categories, and flavor profiles that participate in the LP solver the same way shared ingredients do.
- **Daily goal tracking:** a calorie ring and three macro progress bars on the analytics dashboard compare today's logged intake against the user's configured daily targets.

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| LP solver | javascript-lp-solver 0.4.24 | Pure-JS revised simplex implementation with no native add-ons; deploys to any Node.js host without a compile step |
| API framework | Express 5 | Express 5 propagates errors thrown in async handlers automatically; without it, every controller needs an explicit `try/catch` or an `asyncHandler` wrapper |
| ODM | Mongoose 9 | Schema-level enum validation on `flavor` and `category` catches bad ingredient data at the model layer; the compound unique index on `PantryItem(user, ingredient)` is declared in the schema, not in a separate migration |
| Database | MongoDB Atlas | `MealLog.items` is a variable-length array of ingredient entries per meal; a document store avoids a many-to-many junction table and join overhead on history reads |
| Frontend library | React 19 | The 200-400ms LP solver response does not block the input form; `useCallback` on `AuthContext` methods prevents re-renders across the context tree on every keystroke |
| Build tool | Vite 7 + @tailwindcss/vite | Tailwind 4's Vite plugin compiles utility classes in a single pipeline pass, removing the separate PostCSS step and cutting CSS rebuild time in development |
| Charts | Recharts 2.13 | `AreaChart` and `PieChart` primitives accept the raw `MealLog` aggregate arrays directly; no adapter layer between the API response shape and the chart data format |
| Auth | JWT + bcryptjs | Stateless tokens; the `protect` middleware re-fetches the user by ID on every protected request, so a deleted account cannot authenticate with a cached token |

---

## Architecture

```
Browser (React 19 + Vite 7)
        |
        |  HTTP/JSON   Authorization: Bearer <JWT>
        v
Express 5 API  (Node.js)
  |-- /api/user          register, login, JWT issuance
  |-- /api/pantry        CRUD, consume, meal-log write, low-stock, history
  |-- /api/ingredients   list shared library, create custom ingredient
  |-- /api/generate      LP solve from pantry; reverse solve from full DB
  `-- /api/recipes       save, rename, delete, cook
        |
        |  Mongoose 9
        v
MongoDB Atlas
  |-- users          email unique index; bcrypt hash, no plaintext password
  |-- ingredients    85 shared records; name unique; flavor + category enums
  |-- pantryitems    compound unique index (user, ingredient); threshold field
  |-- meallogs       per-consumption events; totalMacros denormalized at write
  `-- recipes        user-scoped; ingredients array; totalMacros pre-computed
```

The `Ingredient` collection is shared across all users. Each `PantryItem` stores an `ObjectId` reference to the ingredient and the user's current gram quantity. When the solver runs, it issues one `find({ user }).populate('ingredient')` to load all macro data. A correction to an ingredient's protein value propagates to all future solver runs immediately, with no per-user data to update.

Meal logs denormalize macros at the point of consumption rather than on read. This trades a small write amplification (computing and storing per-item macros on every consumption event) for fast analytics reads: the dashboard charts query only `MealLog.totalMacros` and never touch the `Ingredient` collection.

---

## How It Works

### Pantry-based generation

The user enters protein, carbs, and fats targets and selects a flavor profile. The frontend POSTs to `POST /api/generate`. The backend loads the user's `PantryItem` records with `find({ user }).populate('ingredient')`, filters by flavor, and calls `solveMultipleMeals(targets, filteredItems, 3)`.

Inside `solveMultipleMeals`, each pantry item becomes an LP variable with protein, carbs, and fats coefficients of `macro_per_100g / 100`. The item's pantry quantity is the variable's upper bound. The model minimizes a `cost` objective. On each of up to 15 iterations, every variable receives a cost randomized uniformly in [0.5, 1.5), which steers the simplex algorithm toward different vertices of the feasibility polytope. After each feasible result, the nonzero ingredient-quantity pairs are sorted alphabetically and joined as `"Ingredient:grams|..."`, then checked against a `Set`; duplicates are discarded. The loop exits when 3 unique plans accumulate or 15 iterations exhaust.

The response returns the plan array. The user selects one or more plans and clicks Consume. The frontend aggregates quantities across all selected plans (summing grams for any ingredient appearing in multiple plans) and POSTs to `POST /api/pantry/consume`. The controller resolves each ingredient name to an `ObjectId` via `Ingredient.findOne({ name })`, deducts the gram amount from the matching `PantryItem`, deletes items at or below 0.1g (a floating-point precision threshold), and writes a `MealLog` with per-ingredient macros computed as `amount / servingSize * nutrient_per_serving`.

### Reverse (shopping list) mode

The reverse solver loads all `Ingredient` documents from the database, applies the flavor filter, and caps each variable at 400g. It runs the LP once with a randomized cost vector. On a feasible result, the controller fetches the user's pantry and diffs each required ingredient against available stock, producing: what the optimal recipe needs, how much is already on hand, and the per-ingredient shortfall to buy.

---

## Getting Started

### Prerequisites

- Node.js v16.0.0 or higher
- npm v8.0.0 or higher
- MongoDB Atlas cluster, or a local MongoDB instance at `mongodb://localhost:27017`

### Installation

```bash
git clone https://github.com/parthiv-2006/MacroMatch.git
```

Backend:

```bash
cd MacroMatch/backend
npm install
```

Frontend (separate terminal):

```bash
cd MacroMatch/frontend
npm install
```

### Configuration

**`backend/.env`**

| Variable | Description |
|----------|-------------|
| `PORT` | Port for the Express server (defaults to 3000) |
| `MONGO_URI` | Full MongoDB connection string, e.g. `mongodb+srv://user:pass@cluster.mongodb.net/macromatch` |
| `JWT_SECRET` | Signing secret for JWTs; use a random 256-bit string in production |
| `NODE_ENV` | Set to `production` to restrict CORS to `FRONTEND_URL` and suppress stack traces in error responses |
| `FRONTEND_URL` | Allowed CORS origin in production, e.g. `https://macro-match-cyan.vercel.app` |

**`frontend/.env`**

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Base URL of the backend API, e.g. `https://your-backend.onrender.com` |

### Seed the ingredient database

The LP solver requires ingredient documents to exist. The seed script upserts 85 foods across proteins, carbs, fats, vegetables, fruits, and dairy using `findOneAndUpdate` with `upsert: true`, so it is safe to run multiple times:

```bash
cd backend
npm run seed
```

### Running locally

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies `/api/*` requests to `http://localhost:3000`, so no CORS configuration is needed locally.

---

## Testing

The backend has a Jest unit test suite covering the core business logic. Tests run in CI on every push and pull request to `main` via GitHub Actions (see badge above).

```bash
cd backend
npm test
```

**What is tested:**

| File | Coverage |
|------|----------|
| `utils/macroSolver.js` | LP solve returns distinct plans, handles empty pantry and infeasible targets |
| `controllers/userController.js` | All `validatePassword` rules (length, case, digit, special char) |
| `controllers/pantryController.js` | `toPantryItemResponse` — `isLowStock` flag and threshold defaulting |
| `controllers/solverController.js` | `solveFromAllIngredients` — plan shape, totals, infeasible case, per-ingredient cap |
| `middleware/authMiddleware.js` | No token, invalid token, user not found, valid token attaches `req.user` |
| `middleware/errorMiddleware.js` | Stack trace suppression in production, status code passthrough |

All tests run without a live database connection — Mongoose models are mocked where needed.

---

## Project Structure

```
MacroMatch/
├── backend/
│   ├── controllers/
│   │   ├── ingredientController.js   list shared library; create custom ingredients
│   │   ├── pantryController.js       CRUD, consume, meal-log write, low-stock query
│   │   ├── recipeController.js       save, rename, delete recipes; cook triggers consume path
│   │   ├── solverController.js       LP model construction for pantry and reverse modes
│   │   └── userController.js         register, login, JWT issuance with 7-day expiry
│   ├── middleware/
│   │   ├── authMiddleware.js          Bearer token verify; attaches req.user minus password field
│   │   └── errorMiddleware.js         hides stack traces when NODE_ENV=production
│   ├── models/
│   │   ├── Ingredient.js              name, calories, protein, carbs, fats, servingSize, category, flavor
│   │   ├── MealLog.js                 consumption events; items[] with per-item macros; totalMacros
│   │   ├── PantryItem.js              user + ingredient ObjectId refs; quantity; threshold; compound unique index
│   │   ├── Recipe.js                  user-scoped; ingredients with names and gram amounts; totalMacros
│   │   └── User.js                    name, email (unique index), bcrypt password hash
│   ├── routes/                        thin Express routers; all protected routes apply authMiddleware
│   ├── utils/
│   │   └── macroSolver.js             LP model builder; randomized cost loop; Set-based deduplication
│   ├── seedIngredients.js             upserts 85 ingredients via findOneAndUpdate with upsert: true
│   └── server.js                      app setup, CORS config, route mounting, DB connect + listen
│
└── frontend/src/
    ├── components/
    │   ├── AddItemForm.jsx         ingredient search dropdown + quantity input for pantry
    │   ├── AppShell.jsx            sidebar navigation and main content layout wrapper
    │   ├── ConfirmModal.jsx        reusable confirm dialog; supports localStorage-backed "don't ask again"
    │   ├── PantryList.jsx          pantry table with inline quantity and threshold editing
    │   ├── PromptModal.jsx         text-input modal used for naming saved recipes
    │   └── ProtectedRoute.jsx      reads AuthContext; redirects to /login if user is null
    ├── context/
    │   └── AuthContext.jsx         login, register, logout; user state persisted to localStorage
    ├── pages/
    │   ├── AnalyticsDashboard.jsx  calorie ring, macro bars, area chart, pantry donut, KPI cards
    │   ├── CreateIngredient.jsx    custom ingredient form with category and flavor enum fields
    │   ├── DashboardPage.jsx       pantry inventory table, low-stock panel, add-item form
    │   ├── GeneratorPage.jsx       LP result cards (selectable), shopping list tab, consume action
    │   ├── History.jsx             MealLog list sorted newest-first with per-entry macro breakdown
    │   └── Recipes.jsx             saved recipes with cook, delete, search, and sort actions
    └── services/                   Axios wrappers for each API surface; token read from localStorage per call
```

---

## Known Limitations

- **No test coverage:** the LP model construction, pantry deduction arithmetic, and macro ratio calculations have no automated tests. A rounding error in `amount / servingSize * nutrient` would not surface until a user notices incorrect nutrition data.
- **Non-transactional consumption:** `consumePantryItems` runs sequential MongoDB writes inside a `for...of` loop with no session or transaction. A server crash after deducting some ingredients but before writing the `MealLog` leaves pantry stock reduced with no corresponding log entry.
- **LP variety degrades with small pantries:** the randomized cost perturbation generates variety by exploring different vertices of the feasibility polytope. With three or fewer ingredients that satisfy the macro constraints, all 15 iterations typically converge on the same solution, returning fewer than three options.
- **Exact-string ingredient name matching:** the consume and recipe endpoints resolve ingredients by `Ingredient.findOne({ name })`. Any casing difference or trailing whitespace in a generated plan causes a silent miss, leaving that ingredient's pantry quantity unchanged.
- **No calorie constraint in the LP model:** the solver hits protein, carbs, and fats targets but does not constrain total calories. A macro-correct plan drawn from dense ingredients (peanut butter at 588 kcal/100g, almonds at 579 kcal/100g) can satisfy the gram targets while far exceeding a calorie budget.
- **Development CORS is open:** when `NODE_ENV` is not `production`, the Express CORS middleware sets `origin: '*'`. Any local or staging deployment accepts requests from any origin.

---

## What I Would Build Next

1. **Add a calorie constraint to the LP model:** the `MealLog` schema already stores calories per entry. The change in `macroSolver.js` is two lines: add `calories: { min: target - 50, max: target + 50 }` to `constraints` and compute a `calories` coefficient for each variable as `calories_per_100g / 100`. This prevents calorie-surprising solutions without touching any other part of the stack.

2. **Transactional pantry consumption:** wrap the deduction loop in a MongoDB client session using `session.withTransaction(...)`. If any ingredient lookup or write fails mid-loop, the session rolls back all quantity changes and skips the `MealLog` write, giving users accurate pantry state after any failure.

3. **Batch ingredient lookups on consumption:** replace the sequential `Ingredient.findOne` calls inside the consume loop with a single `Ingredient.find({ name: { $in: ingredientNames } })` query. At 10 consumed ingredients, the current approach issues 10 serial database round-trips; the batch version issues one.

4. **Named macro presets per user:** many users cycle between bulk, cut, and maintenance days with fixed targets. Storing named presets per user (e.g., "Cut Day: 160g P / 200g C / 60g F") and pre-populating the generator form would eliminate the most common repeated manual entry.

5. **Private vs. shared custom ingredients:** ingredients created via `POST /api/ingredients` currently land in the shared library visible to all users. A `createdBy` field and a `visibility: 'public' | 'private'` flag on the `Ingredient` schema would let users keep proprietary macro blends private while still contributing common foods to the shared pool.

---

## Deployment

**Frontend:** [https://macro-match-cyan.vercel.app/](https://macro-match-cyan.vercel.app/) (Vercel, root directory: `frontend`)

**Backend:** Render Web Service (root directory: `backend`, start command: `npm start`)

**Database:** MongoDB Atlas (shared `ingredients` collection; per-user collections scoped by `user` ObjectId)

### Deploy your own

#### Frontend (Vercel)

```bash
# Set root directory to "frontend" in Vercel project settings
# Add environment variable:
VITE_API_BASE_URL=https://your-backend.onrender.com
```

#### Backend (Render)

```bash
# Set root directory to "backend"
# Build command: npm install
# Start command: npm start
# Add environment variables:
MONGO_URI=your_atlas_connection_string
JWT_SECRET=your_256_bit_secret
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
```

---

## License

[ISC](LICENSE)

---

**Parthiv Paul**
[LinkedIn](https://www.linkedin.com/in/parthiv-paul) · [GitHub](https://github.com/parthiv-2006) · [parthiv.paul5545@gmail.com](mailto:parthiv.paul5545@gmail.com)
