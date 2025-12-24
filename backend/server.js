require("dotenv").config()
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const PORT = process.env.PORT || 3000

const app = express()
const userRoutes = require("./routes/userRoutes")

app.use(express.json())
app.use(cors())

app.use("/api/user", userRoutes)

app.get("/", (req, res) => {
    res.send("Server Working")
})


mongoose.connect(process.env.MONGO_URI)
.then(() => {
    app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log('MongoDB Connected')
})
})
.catch((err) => {
    console.log("Failed to connect to MongoDB", err)
})

