const express = require("express")
const router = express.Router()
const { generateMeal } = require("../controllers/solverController")
const { protect } = require("../middleware/authMiddleware")

router.post("/", protect, generateMeal)

module.exports = router