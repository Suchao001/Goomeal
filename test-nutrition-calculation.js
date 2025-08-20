// Test calculation for nutrition targets from meal plan
const testMealData = {
  "breakfast": [
    {
      "name": "ข้าวต้มไข่ไก่",
      "calories": 667,
      "protein": 28,
      "carb": 57,
      "fat": 16,
      "image": "https://via.placeholder.com/60x60/E5E7EB/6B7280?text=Food"
    },
    {
      "name": "ข้าวหมา",
      "calories": 300,
      "protein": 40,
      "carb": 20,
      "fat": 30,
      "image": "http://10.10.37.28:3001/images/user_foods/1755072294286_549810228.jpeg"
    }
  ],
  "lunch": [
    {
      "name": "ผัดกะเพราหมูสับ",
      "calories": 889,
      "protein": 43,
      "carb": 80,
      "fat": 22,
      "image": "https://via.placeholder.com/60x60/E5E7EB/6B7280?text=Food"
    },
    {
      "name": "ข้าวต้มไข่เจียว",
      "calories": 350,
      "protein": 15,
      "carb": 50,
      "fat": 10,
      "image": "https://via.placeholder.com/60x60/E5E7EB/6B7280?text=Food"
    }
  ],
  "dinner": [
    {
      "name": "ต้มยำกุ้ง",
      "calories": 667,
      "protein": 46,
      "carb": 44,
      "fat": 19,
      "image": "https://via.placeholder.com/60x60/E5E7EB/6B7280?text=Food"
    }
  ],
  "totalCalories": 2873
};

// Calculate totals
let totalProtein = 0;
let totalCarbs = 0;
let totalFat = 0;
let totalCalories = 0;

// Sum breakfast
testMealData.breakfast.forEach(meal => {
  totalProtein += meal.protein || 0;
  totalCarbs += meal.carb || 0;
  totalFat += meal.fat || 0;
  totalCalories += meal.calories || 0;
});

// Sum lunch
testMealData.lunch.forEach(meal => {
  totalProtein += meal.protein || 0;
  totalCarbs += meal.carb || 0;
  totalFat += meal.fat || 0;
  totalCalories += meal.calories || 0;
});

// Sum dinner
testMealData.dinner.forEach(meal => {
  totalProtein += meal.protein || 0;
  totalCarbs += meal.carb || 0;
  totalFat += meal.fat || 0;
  totalCalories += meal.calories || 0;
});

console.log('=== MEAL PLAN NUTRITION TARGETS ===');
console.log(`Total Calories: ${totalCalories} (should match totalCalories: ${testMealData.totalCalories})`);
console.log(`Total Protein: ${totalProtein}g`);
console.log(`Total Carbs: ${totalCarbs}g`);
console.log(`Total Fat: ${totalFat}g`);
console.log('===============================');

// Expected results:
// Breakfast: Protein=68g, Carbs=77g, Fat=46g, Calories=967
// Lunch: Protein=58g, Carbs=130g, Fat=32g, Calories=1239  
// Dinner: Protein=46g, Carbs=44g, Fat=19g, Calories=667
// TOTAL: Protein=172g, Carbs=251g, Fat=97g, Calories=2873
