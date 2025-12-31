require("dotenv").config()
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const PORT = process.env.PORT || 3000

const app = express()
const userRoutes = require("./routes/userRoutes")
const pantryRoutes = require("./routes/pantryRoutes")
const ingredientRoutes = require("./routes/ingredientRoutes")
const solverRoutes = require("./routes/solverRoutes")
const recipeRoutes = require("./routes/recipeRoutes")
const { errorHandler } = require("./middleware/errorMiddleware")

// Middleware
app.use(express.json())

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || '*' 
    : '*',
  credentials: true
}
app.use(cors(corsOptions))

// Routes
app.use("/api/user", userRoutes)
app.use("/api/pantry", pantryRoutes)
app.use("/api/ingredients", ingredientRoutes)
app.use("/api/generate", solverRoutes)
app.use("/api/recipes", recipeRoutes)

// Health check endpoint
app.get("/", (req, res) => {
    res.json({ 
        status: "OK", 
        message: "MacroMatch API is running",
        version: "1.0.0"
    })
})

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" })
})

// Error handler (must be last)
app.use(errorHandler)

// Database connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    app.listen(PORT, () => {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`Server running on port ${PORT}`)
            console.log('MongoDB Connected')
        }
    })
})
.catch((err) => {
    console.error("Failed to connect to MongoDB", err)
    process.exit(1)
})

