const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" })
}

const validatePassword = (password) => {
  // 8-16 chars, at least 1 lowercase, 1 uppercase, 1 number, 1 special char
  if (typeof password !== "string") return "Password is required"
  if (password.length < 8 || password.length > 16) return "Password must be 8-16 characters"
  if (!/[a-z]/.test(password)) return "Password must contain a lowercase letter"
  if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter"
  if (!/[0-9]/.test(password)) return "Password must contain a number"
  if (!/[^A-Za-z0-9]/.test(password)) return "Password must contain a special character"
  return null
}

const registerUser = async (req, res) => {
  let { name, email, password, confirmPassword } = req.body

  // basic field checks
  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" })
  }

  email = String(email).trim().toLowerCase()

  const pwError = validatePassword(password)
  if (pwError) return res.status(400).json({ message: pwError })

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" })
  }

  try {
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: "Email already in use" })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // FIX: don't use `new User.create(...)`
    const user = await User.create({ name, email, password: hashedPassword })

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

const loginUser = async (req, res) => {
  let { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" })
  }

  email = String(email).trim().toLowerCase()

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: "Invalid email and/or password" })
    }

    const matchedPassword = await bcrypt.compare(password, user.password)
    if (!matchedPassword) {
      return res.status(401).json({ message: "Invalid email and/or password" })
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

module.exports = { registerUser, loginUser }