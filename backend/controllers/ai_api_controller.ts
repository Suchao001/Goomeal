import axios from 'axios';
import OpenAI from 'openai';
import db from '../db_config';

const url = process.env.AI_API || 'http://localhost:11434';

const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY
});

const getUserInfo = async (userId: number) => {
  try {
    const user = await db('users').where({ id: userId }).first();
    if (!user) {
      throw new Error('User not found');
    }
    return {
      age: user.age,
      weight: user.weight,
      height: user.height,
      gender: user.gender,
      body_fat: user.body_fat
    };
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw error;
  }
};

export async function suggestFood(payload?: any) {
  try {
    const {
      mealType,
      hungerLevel,
      ingredients,
      foodType,
      dietaryRestrictions,
      complexityLevel
    } = payload || {};

    const foodSuggestionPrompt = `You are an AI assistant that generates a single Thai food menu suggestion.
Your response MUST be a single, valid JSON object.
It MUST NOT be a JSON array.
It MUST NOT be wrapped in markdown backticks like \`\`\`json.
The JSON object MUST only contain these exact keys: "name", "cal", "carbs", "protein", "fat", "ingredients".

Here is an example of the required format:
{
  "name": "ต้มยำกุ้ง",
  "cal": 200,
  "carbs": 10,
  "protein": 30,
  "fat": 5,
  "ingredients": ["กุ้ง", "ตะไคร้", "ใบมะกรูด", "พริกขี้หนู", "น้ำมะนาว"]
}

Now, generate a single food suggestion based on these user preferences:
- Meal Type: ${mealType}
- Hunger Level: ${hungerLevel}
- Available Ingredients: ${ingredients}
- Food Type: ${foodType}
- Dietary Restrictions: ${dietaryRestrictions}
- Complexity: ${complexityLevel}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: foodSuggestionPrompt
        }
      ]
    });

    const content = response.choices[0].message.content;

    // ล้าง backticks หรือคำตอบแปลกๆ ที่ AI อาจใส่มา
    const cleaned = content?.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();

    try {
      return JSON.parse(cleaned || '');
    } catch (e) {
      console.error('Failed to parse JSON from AI response:', cleaned);
      throw new Error('Invalid JSON returned from AI');
    }

  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      console.error('Error calling AI API:', err.response.data);
    } else if (err instanceof Error) {
      console.error('Error calling AI API:', err.message);
    } else {
      console.error('An unknown error occurred:', err);
    }
    throw err;
  }
}


export async function getFoodPlanSuggestions(userId: number, payload?: any) {
  try {
    const {
      
      target_goal,
      target_weight,
      activity_level,
      eating_type,
      dietary_restrictions,
      additional_requirements,
      totalPlanDay
    } = payload || {};

    const {
      age,
      weight,
      height,
      gender,
      body_fat
    } = await getUserInfo(userId);

    const foodPlanPrompt = `
You are an AI assistant that generates a multi-day Thai food plan for healthy eating.

Your response MUST be a single, valid JSON object.
Each key MUST be a string number from "1" to "${totalPlanDay}" representing each day in the plan.

Each day object MUST contain:
- "totalCal" (number): total calories for the day
- "meals" (object) containing:
  - "breakfast", "lunch", "dinner" (each is an object):
    - "name" (string): name of the meal (e.g. "อาหารมื้อเช้า")
    - "time" (string): time in HH:mm format (e.g. "07:00")
    - "items" (array of objects), each with:
      - "name": (string) name of food item
      - "cal": (number) calories
      - "carb": (number) grams of carbohydrates
      - "fat": (number) grams of fat
      - "protein": (number) grams of protein
      - "img": (string) empty string
      - "ingredient": (string) empty string
      - "source": (string) MUST be "ai"
      - "isUserFood": (boolean) MUST be false
    - "totalCal" (number): total calories of that meal

⚠️ Important Rules:
- The full response MUST be a single valid JSON object.
- DO NOT wrap the response in markdown (e.g. \`\`\`json).
- DO NOT include explanations, comments, or descriptions.
- Keep calories reasonable and aligned with the user's needs.
- Only generate content in Thai.

User Preferences:
- Age: ${age}
- Weight: ${weight}
- Height: ${height}
- Gender: ${gender}
- Body Fat: ${body_fat}
- Target Goal: ${target_goal}
- Target Weight: ${target_weight}
- Activity Level: ${activity_level}
- Eating Type: ${eating_type}
- Dietary Restrictions: ${dietary_restrictions}
- Additional Requirements: ${additional_requirements}

Generate a food plan for ${totalPlanDay} days. Format the response as described.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: foodPlanPrompt
        }
      ]
    });

    const content = response.choices[0].message.content;
    const cleaned = content?.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();

    let parsedData;
    try {
      if (!cleaned) {
        throw new Error("AI response is empty");
      }
      parsedData = JSON.parse(cleaned);
    } catch (e) {
      console.error('Failed to parse JSON from AI response:', cleaned);
      throw new Error('Invalid JSON returned from AI');
    }

    Object.keys(parsedData).forEach(day => {
      const dayPlan = parsedData[day];
      if (dayPlan && dayPlan.meals) {
        
        Object.keys(dayPlan.meals).forEach(mealKey => {
          const meal = dayPlan.meals[mealKey];
          
          if (meal && Array.isArray(meal.items)) {

            meal.items = meal.items.filter((item: any) =>
              item && Object.keys(item).length > 0
            );
          }
        });
      }
    });
    try {
      return JSON.parse(cleaned || '');
    } catch (e) {
      console.error('Failed to parse JSON from AI response:', cleaned);
      throw new Error('Invalid JSON returned from AI');
    }

  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      console.error('Error calling AI API:', err.response.data);
    } else if (err instanceof Error) {
      console.error('Error calling AI API:', err.message);
    } else {
      console.error('An unknown error occurred:', err);
    }
    throw err;
  }
}
