const express = require("express")
const router = express.Router()
const pantryController = require("../controllers/pantryController")
const { protect } = require("../middleware/authMiddleware")


router.get("/", protect, pantryController.getPantryItems)
router.post("/", protect, pantryController.postPantryItem)
router.post("/consume", protect, pantryController.consumePantryItems)
router.put("/:id", protect, pantryController.updatePantryItem)
router.delete("/:id", protect, pantryController.deletePantryItem)

module.exports = router