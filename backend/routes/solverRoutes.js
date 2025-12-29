const express = require("express")
const router = express.Router()
const { generateMeal, generateReverseMeal } = require("../controllers/solverController")
const { protect } = require("../middleware/authMiddleware")

router.post("/", protect, generateMeal)
router.post("/reverse", protect, generateReverseMeal)

module.exports = router