require("dotenv").config()
const mongoose = require("mongoose")
const Ingredient = require("./models/Ingredient")

const ingredients = [
  { name: 'Chicken Breast (Raw)', calories: 110, protein: 23, carbs: 0, fats: 1 },
  { name: 'White Rice (Raw)', calories: 365, protein: 7, carbs: 80, fats: 1 },
  { name: 'Oats (Rolled)', calories: 389, protein: 16.9, carbs: 66, fats: 6.9 },
  { name: 'Egg (Large)', calories: 155, protein: 13, carbs: 1.1, fats: 11 },
  { name: 'Whey Protein Isolate', calories: 370, protein: 90, carbs: 1, fats: 1 },
  { name: 'Olive Oil', calories: 884, protein: 0, carbs: 0, fats: 100 },
  { name: 'Broccoli (Raw)', calories: 34, protein: 2.8, carbs: 7, fats: 0.4 },
  { name: 'Sweet Potato (Raw)', calories: 86, protein: 1.6, carbs: 20, fats: 0.1 },
  { name: 'Almonds', calories: 579, protein: 21, carbs: 22, fats: 50 },
  { name: 'Greek Yogurt (Non-fat)', calories: 59, protein: 10, carbs: 3.6, fats: 0.4 }
]

const seedDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("MongoDB Connected (Seed)")
        
        await Ingredient.deleteMany({})
        console.log('Old ingredients removed.')

        await Ingredient.insertMany(ingredients)
        console.log('Ingredients Imported!')

        process.exit()

    } catch (err) {
        console.log(err)
    }
}

seedDB()