const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")
const { protect } = require("../middleware/authMiddleware")


router.post('/', userController.registerUser)
router.post('/login', userController.loginUser)
router.get('/me', protect, userController.getMe)
router.put('/goals', protect, userController.updateGoals)

module.exports = router