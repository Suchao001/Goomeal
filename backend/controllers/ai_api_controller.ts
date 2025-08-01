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

    const target_weight_ = weight + (target_goal === 'increase' ? target_weight : -target_weight);
    const foodPlanPrompt = `
    You are an **expert nutritionist and meticulous JSON generation specialist**. Your task is to create a realistic, balanced, and varied multi-day Thai food plan. Your primary goal is to return a single, valid, and clean JSON object.

    ---
    ### **Part 1: Nutritional & Quality Guidelines**
    ---
    1.  **Meal Variety:** Ensure a wide variety of food items throughout the ${totalPlanDay}-day plan. Avoid repeating the same main dishes too frequently.
    2.  **Macronutrient Balance:** Adjust the macronutrient distribution (carbohydrates, protein, fat) to align with the user's "Target Goal". For example, a "Muscle Gain" goal requires higher protein, while a "Weight Loss" goal requires a balanced deficit.
    3.  **Meal Appropriateness:** Suggest energy-providing meals for "breakfast". For "dinner", suggest satisfying but not overly heavy meals.
    4.  **Practicality:** The suggested Thai dishes must be practical for an average person to prepare or find in Thailand. Avoid overly complex or rare dishes.
    5.  **Strictly Adhere to Restrictions:** The "Dietary Restrictions" ("${dietary_restrictions}") are non-negotiable. The plan MUST NOT contain any restricted items.

    ---
    ### **Part 2: JSON Format & Technical Rules**
    ---
    - Your response MUST be a single, valid JSON object and nothing else.
    - Each top-level key MUST be a string number from "1" to "${totalPlanDay}".
    - Each day object MUST contain: "totalCal" (number), and "meals" (object).
    - The "meals" object MUST contain "breakfast", "lunch", and "dinner".
    - Each meal object MUST contain: "name" (string), "time" (string), "items" (array), and "totalCal" (number).

    **Rules for the "items" array:**
    - Each object inside the array represents ONE food item and MUST contain: "name", "cal", "carb", "fat", "protein", "img", "ingredient", "source", "isUserFood".
    - **CRITICAL: The "items" array MUST NOT contain empty objects (like {}).**
    - **Example of a valid item:** {"name": "ข้าวกล้องและอกไก่ย่าง", "cal": 450, "carb": 50, "fat": 10, "protein": 40, "img": "", "ingredient": "", "source": "ai", "isUserFood": false}

    **Final Output Rules:**
    - DO NOT wrap the response in markdown (e.g., \`\`\`json).
    - DO NOT include any explanations, notes, or comments.
    - **Ensure the \`totalCal\` for each meal is the precise sum of the \`cal\` from its \`items\`. Ensure the day's \`totalCal\` is the sum of its meals' \`totalCal\`.**
    - All text content, like food names, must be in Thai.
    - Before responding, double-check that your entire output (both quality and format) strictly follows all rules.

    ---
    ### **Part 3: User Data**
    ---
    ${JSON.stringify({
        "Age": age,
        "Weight": weight,
        "Height": height,
        "Gender": gender,
        "Body Fat": body_fat,
        "Target Goal": target_goal,
        "Target Weight": target_weight_,
        "Activity Level": activity_level,
        "Eating Type": eating_type,
        "Dietary Restrictions": dietary_restrictions,
        "Additional Requirements": additional_requirements
    })}

    Generate a food plan for ${totalPlanDay} days based on all the rules and user data provided.
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
