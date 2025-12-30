require('dotenv').config();
const mongoose = require('mongoose');
const Ingredient = require('./models/Ingredient');

const commonIngredients = [
  // Proteins
  { name: "Chicken Breast (Raw)", calories: 110, protein: 23, carbs: 0, fats: 1, servingSize: 100, category: "protein", flavor: "savory" },
  { name: "Chicken Thigh (Raw)", calories: 170, protein: 20, carbs: 0, fats: 10, servingSize: 100, category: "protein", flavor: "savory" },
  { name: "Ground Beef (90% Lean)", calories: 176, protein: 20, carbs: 0, fats: 10, servingSize: 100, category: "protein", flavor: "savory" },
  { name: "Salmon (Raw)", calories: 208, protein: 20, carbs: 0, fats: 13, servingSize: 100, category: "protein", flavor: "savory" },
  { name: "Egg (Large)", calories: 143, protein: 12.6, carbs: 0.7, fats: 9.5, servingSize: 100, category: "protein", flavor: "neutral" }, // ~2 eggs
  { name: "Egg Whites", calories: 52, protein: 11, carbs: 0.7, fats: 0.2, servingSize: 100, category: "protein", flavor: "neutral" },
  { name: "Tuna (Canned in Water)", calories: 116, protein: 26, carbs: 0, fats: 1, servingSize: 100, category: "protein", flavor: "savory" },
  { name: "Greek Yogurt (Non-fat)", calories: 59, protein: 10, carbs: 3.6, fats: 0.4, servingSize: 100, category: "dairy", flavor: "neutral" },
  { name: "Cottage Cheese (Low fat)", calories: 82, protein: 11, carbs: 3.4, fats: 2.3, servingSize: 100, category: "dairy", flavor: "savory" },
  { name: "Tofu (Firm)", calories: 144, protein: 17, carbs: 3, fats: 9, servingSize: 100, category: "protein", flavor: "neutral" },
  { name: "Whey Protein Powder", calories: 370, protein: 75, carbs: 5, fats: 5, servingSize: 100, category: "protein", flavor: "sweet" }, // Generic

  // Carbs
  { name: "White Rice (Raw)", calories: 365, protein: 7, carbs: 80, fats: 0.7, servingSize: 100, category: "carb", flavor: "neutral" },
  { name: "Brown Rice (Raw)", calories: 367, protein: 7.5, carbs: 76, fats: 3.2, servingSize: 100, category: "carb", flavor: "neutral" },
  { name: "Oats (Rolled)", calories: 379, protein: 13, carbs: 67, fats: 6.5, servingSize: 100, category: "carb", flavor: "neutral" },
  { name: "Sweet Potato (Raw)", calories: 86, protein: 1.6, carbs: 20, fats: 0.1, servingSize: 100, category: "carb", flavor: "savory" },
  { name: "Potato (Raw)", calories: 77, protein: 2, carbs: 17, fats: 0.1, servingSize: 100, category: "carb", flavor: "savory" },
  { name: "Pasta (Dry)", calories: 371, protein: 13, carbs: 75, fats: 1.5, servingSize: 100, category: "carb", flavor: "neutral" },
  { name: "Quinoa (Raw)", calories: 368, protein: 14, carbs: 64, fats: 6, servingSize: 100, category: "carb", flavor: "neutral" },
  { name: "Banana", calories: 89, protein: 1.1, carbs: 23, fats: 0.3, servingSize: 100, category: "fruit", flavor: "sweet" },
  { name: "Apple", calories: 52, protein: 0.3, carbs: 14, fats: 0.2, servingSize: 100, category: "fruit", flavor: "sweet" },
  { name: "Blueberries", calories: 57, protein: 0.7, carbs: 14, fats: 0.3, servingSize: 100, category: "fruit", flavor: "sweet" },
  { name: "Bread (Whole Wheat)", calories: 247, protein: 13, carbs: 41, fats: 3.4, servingSize: 100, category: "carb", flavor: "neutral" },

  // Fats
  { name: "Almonds", calories: 579, protein: 21, carbs: 22, fats: 50, servingSize: 100, category: "fat", flavor: "neutral" },
  { name: "Peanut Butter", calories: 588, protein: 25, carbs: 20, fats: 50, servingSize: 100, category: "fat", flavor: "sweet" },
  { name: "Avocado", calories: 160, protein: 2, carbs: 9, fats: 15, servingSize: 100, category: "fat", flavor: "savory" },
  { name: "Olive Oil", calories: 884, protein: 0, carbs: 0, fats: 100, servingSize: 100, category: "fat", flavor: "savory" },
  { name: "Butter", calories: 717, protein: 0.9, carbs: 0.1, fats: 81, servingSize: 100, category: "fat", flavor: "neutral" },
  { name: "Walnuts", calories: 654, protein: 15, carbs: 14, fats: 65, servingSize: 100, category: "fat", flavor: "neutral" },
  { name: "Chia Seeds", calories: 486, protein: 17, carbs: 42, fats: 31, servingSize: 100, category: "fat", flavor: "neutral" },

  // Vegetables
  { name: "Broccoli", calories: 34, protein: 2.8, carbs: 7, fats: 0.4, servingSize: 100, category: "vegetable", flavor: "savory" },
  { name: "Spinach", calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, servingSize: 100, category: "vegetable", flavor: "savory" },
  { name: "Carrots", calories: 41, protein: 0.9, carbs: 10, fats: 0.2, servingSize: 100, category: "vegetable", flavor: "savory" },
  { name: "Bell Pepper", calories: 20, protein: 0.9, carbs: 4.6, fats: 0.2, servingSize: 100, category: "vegetable", flavor: "savory" },
  { name: "Cucumber", calories: 15, protein: 0.7, carbs: 3.6, fats: 0.1, servingSize: 100, category: "vegetable", flavor: "savory" },
  { name: "Tomato", calories: 18, protein: 0.9, carbs: 3.9, fats: 0.2, servingSize: 100, category: "vegetable", flavor: "savory" },
  { name: "Onion", calories: 40, protein: 1.1, carbs: 9, fats: 0.1, servingSize: 100, category: "vegetable", flavor: "savory" },
  { name: "Mushrooms", calories: 22, protein: 3.1, carbs: 3.3, fats: 0.3, servingSize: 100, category: "vegetable", flavor: "savory" },
  { name: "Asparagus", calories: 20, protein: 2.2, carbs: 3.9, fats: 0.1, servingSize: 100, category: "vegetable", flavor: "savory" },
  { name: "Green Beans", calories: 31, protein: 1.8, carbs: 7, fats: 0.2, servingSize: 100 },

  // More Proteins
  { name: "Turkey Breast (Raw)", calories: 135, protein: 24, carbs: 0, fats: 3, servingSize: 100 },
  { name: "Pork Chop (Lean)", calories: 143, protein: 21, carbs: 0, fats: 6, servingSize: 100 },
  { name: "Shrimp (Raw)", calories: 85, protein: 20, carbs: 0, fats: 0.5, servingSize: 100 },
  { name: "Cod (Raw)", calories: 82, protein: 18, carbs: 0, fats: 0.7, servingSize: 100 },
  { name: "Tilapia (Raw)", calories: 96, protein: 20, carbs: 0, fats: 1.7, servingSize: 100 },
  { name: "Lentils (Dry)", calories: 353, protein: 25, carbs: 60, fats: 1, servingSize: 100 },
  { name: "Black Beans (Dry)", calories: 341, protein: 21, carbs: 62, fats: 1.4, servingSize: 100 },
  { name: "Chickpeas (Dry)", calories: 364, protein: 19, carbs: 61, fats: 6, servingSize: 100 },
  { name: "Edamame (Shelled)", calories: 121, protein: 11, carbs: 10, fats: 5, servingSize: 100 },
  { name: "Seitan", calories: 370, protein: 75, carbs: 14, fats: 2, servingSize: 100 },

  // More Carbs
  { name: "Couscous (Dry)", calories: 376, protein: 13, carbs: 77, fats: 0.6, servingSize: 100 },
  { name: "Barley (Dry)", calories: 354, protein: 12, carbs: 73, fats: 2.3, servingSize: 100 },
  { name: "Bagel (Plain)", calories: 250, protein: 10, carbs: 49, fats: 1.5, servingSize: 100 },
  { name: "Tortilla (Corn)", calories: 218, protein: 6, carbs: 45, fats: 3, servingSize: 100 },
  { name: "Tortilla (Flour)", calories: 297, protein: 8, carbs: 49, fats: 8, servingSize: 100 },
  { name: "Crackers (Saltine)", calories: 421, protein: 9, carbs: 74, fats: 9, servingSize: 100 },
  { name: "Popcorn (Air-popped)", calories: 387, protein: 13, carbs: 78, fats: 4.5, servingSize: 100 },
  { name: "Honey", calories: 304, protein: 0.3, carbs: 82, fats: 0, servingSize: 100 },
  { name: "Maple Syrup", calories: 260, protein: 0, carbs: 67, fats: 0, servingSize: 100 },

  // More Fats
  { name: "Cashews", calories: 553, protein: 18, carbs: 30, fats: 44, servingSize: 100 },
  { name: "Pistachios", calories: 560, protein: 20, carbs: 27, fats: 45, servingSize: 100 },
  { name: "Sunflower Seeds", calories: 584, protein: 21, carbs: 20, fats: 51, servingSize: 100 },
  { name: "Pumpkin Seeds", calories: 559, protein: 30, carbs: 10, fats: 49, servingSize: 100 },
  { name: "Coconut Oil", calories: 862, protein: 0, carbs: 0, fats: 100, servingSize: 100 },
  { name: "Dark Chocolate (70%)", calories: 598, protein: 7.8, carbs: 46, fats: 43, servingSize: 100 },
  { name: "Heavy Cream", calories: 340, protein: 2.8, carbs: 2.7, fats: 36, servingSize: 100 },

  // Fruits
  { name: "Orange", calories: 47, protein: 0.9, carbs: 12, fats: 0.1, servingSize: 100 },
  { name: "Grapes", calories: 69, protein: 0.7, carbs: 18, fats: 0.2, servingSize: 100 },
  { name: "Strawberries", calories: 32, protein: 0.7, carbs: 7.7, fats: 0.3, servingSize: 100 },
  { name: "Pineapple", calories: 50, protein: 0.5, carbs: 13, fats: 0.1, servingSize: 100 },
  { name: "Mango", calories: 60, protein: 0.8, carbs: 15, fats: 0.4, servingSize: 100 },
  { name: "Watermelon", calories: 30, protein: 0.6, carbs: 8, fats: 0.2, servingSize: 100 },
  { name: "Peach", calories: 39, protein: 0.9, carbs: 10, fats: 0.3, servingSize: 100 },
  { name: "Pear", calories: 57, protein: 0.4, carbs: 15, fats: 0.1, servingSize: 100 },

  // Dairy & Alternatives
  { name: "Milk (Whole)", calories: 61, protein: 3.2, carbs: 4.8, fats: 3.3, servingSize: 100 },
  { name: "Milk (2%)", calories: 50, protein: 3.3, carbs: 4.8, fats: 2, servingSize: 100 },
  { name: "Almond Milk (Unsweetened)", calories: 15, protein: 0.5, carbs: 0.3, fats: 1.2, servingSize: 100 },
  { name: "Soy Milk", calories: 54, protein: 3.3, carbs: 6, fats: 1.8, servingSize: 100 },
  { name: "Cheddar Cheese", calories: 402, protein: 25, carbs: 1.3, fats: 33, servingSize: 100 },
  { name: "Mozzarella Cheese", calories: 280, protein: 28, carbs: 3.1, fats: 17, servingSize: 100 },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // Option 2: Upsert (Add if not exists)
    let addedCount = 0;
    for (const ingredient of commonIngredients) {
      const exists = await Ingredient.findOne({ name: ingredient.name });
      if (!exists) {
        await Ingredient.create(ingredient);
        addedCount++;
      }
    }

    console.log(`Successfully added ${addedCount} new ingredients!`);
    console.log('Database seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDB();
