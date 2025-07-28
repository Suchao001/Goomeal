import axios from 'axios';

const url = process.env.AI_API || 'http://localhost:11434';

export async function suggestFood(payload?: any) {
  try {
    const {
      mealType,
      hungerLevel,
      ingredients,
      foodType,
      dietaryRestrictions,
      complexityLevel
    } = payload;
    
    // --- PROMPT ที่ปรับปรุงแล้ว ---
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

    const response = await axios.post(`${url}/api/generate`, {
      model: 'phi4-mini:3.8b',
      prompt: foodSuggestionPrompt,
      stream: false,
      
      format: 'json' 
    });


    let result = response.data.response;
    if (typeof result === 'string') {
        try {
            return JSON.parse(result);
        } catch (e) {
            console.error("Failed to parse AI response as JSON:", result);
            throw new Error("Invalid JSON response from AI");
        }
    }
    return result;

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