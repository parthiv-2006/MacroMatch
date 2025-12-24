const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()


const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: '30d'})
}

const registerUser = async(req, res) => {
    const {name, email, password, confirmPassword} = req.body
    if (password !== confirmPassword) {
        return res.status(400).json({message: "Passwords do not match"})
    }
    try {
        const userExists = await User.findOne({email})
        if (userExists) {
            return res.status(400).json({message: "Email already in Use"})
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const user = new User.create({name, email, password: hashedPassword})
        if (user) {
            return res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id)
            })
        }
    } catch (err) {
        res.status(500).json({message: err.message})
    }
}

const loginUser = async(req, res) => {
    const {email, password} = req.body
    try {
        const user = await User.findOne({email})
        const matchedPassword = await bcrypt.compare(password, user.password)

        if (user && matchedPassword) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id)
            })
        }
        else {
            res.status(401).json({message: "Invalid Email and or Password"})
        }
        
    } catch (err) {
        res.status(500).json({message: err.message})
    }
}

module.exports = {registerUser, loginUser}