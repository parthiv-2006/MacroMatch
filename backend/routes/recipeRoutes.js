const express = require("express")
const router = express.Router()
const recipeController = require("../controllers/recipeController")
const { protect } = require("../middleware/authMiddleware")

router.get("/", protect, recipeController.getRecipes)
router.post("/", protect, recipeController.createRecipe)
router.put("/:id", protect, recipeController.updateRecipeName)
router.delete("/:id", protect, recipeController.deleteRecipe)

module.exports = router