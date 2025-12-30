const express = require("express")
const router = express.Router()
const pantryController = require("../controllers/pantryController")
const { protect } = require("../middleware/authMiddleware")


router.get("/", protect, pantryController.getPantryItems)
router.get("/history", protect, pantryController.getMealHistory)
router.delete("/history/:id", protect, pantryController.deleteMealLog)
router.get("/low-stock", protect, pantryController.getLowStockItems)
router.post("/", protect, pantryController.postPantryItem)
router.post("/consume", protect, pantryController.consumePantryItems)
router.put("/:id", protect, pantryController.updatePantryItem)
router.delete("/:id", protect, pantryController.deletePantryItem)

module.exports = router