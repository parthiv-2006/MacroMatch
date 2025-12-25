const express = require("express")
const router = express.Router()
const ingredientController = require("../controllers/ingredientController")
const { protect } = require("../middleware/authMiddleware")

router.get("/", protect, ingredientController.getIngredients)
router.post("/", protect, ingredientController.createIngredient)

module.exports = router