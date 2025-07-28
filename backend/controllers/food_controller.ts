import { Request, Response } from 'express';
import db from '../db_config';
import path from 'path';

interface UserFoodData {
  name: string;
  cal: number;
  carb: number;
  fat: number;
  protein: number;
  img?: string;
  user_id: number;
  ingredient: string;
  src?: string; 
}

interface FoodSearchResult {
  id: string;
  name: string;
  cal: number;
  carb: number;
  fat: number;
  protein: number;
  img: string | null;
  ingredient: string;
  source: 'user_food' | 'foods';
  isUserFood: boolean;
}

/**
 * Search foods from both user_food and foods tables
 */
export const searchFoods = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const { query, limit = 20 } = req.query;
    const user_id = req.user?.id;

    if (!user_id) {
      res.status(401).json({
        success: false,
        message: 'กรุณาเข้าสู่ระบบ'
      });
      return;
    }

    const searchTerm = query as string || '';
    const limitNum = parseInt(limit as string) || 20;

    let userFoodsQuery = db('user_food')
      .select(
        'id',
        'name', 
        'cal',
        'carb',
        'fat',
        'protein',
        'img',
        'ingredient'
      )
      .where('user_id', user_id);

    let globalFoodsQuery = db('foods')
      .select(
        'id',
        'name',
        'cal', 
        'carb',
        'fat',
        'protein',
        'img',
        'ingredient'
      );

    // Apply search filter if query is provided
    if (searchTerm.trim()) {
      userFoodsQuery = userFoodsQuery.where(function() {
        this.where('name', 'like', `%${searchTerm}%`)
            .orWhere('ingredient', 'like', `%${searchTerm}%`);
      });

      globalFoodsQuery = globalFoodsQuery.where(function() {
        this.where('name', 'like', `%${searchTerm}%`)
            .orWhere('ingredient', 'like', `%${searchTerm}%`);
      });
    }

    // Execute both queries
    const [userFoods, globalFoods] = await Promise.all([
      userFoodsQuery.limit(limitNum / 2),
      globalFoodsQuery.limit(limitNum / 2)
    ]);

    // Transform results and add proper image URLs
    const userFoodResults: FoodSearchResult[] = userFoods.map(food => ({
      id: `user_${food.id}`,
      name: food.name || '',
      cal: parseFloat(food.cal) || 0,
      carb: parseFloat(food.carb) || 0,
      fat: parseFloat(food.fat) || 0,
      protein: parseFloat(food.protein) || 0,
      img: food.img || null, // Already has full path /images/user_foods/...
      ingredient: food.ingredient || '',
      source: 'user_food' as const,
      isUserFood: true
    }));

    const globalFoodResults: FoodSearchResult[] = globalFoods.map(food => ({
      id: `global_${food.id}`,
      name: food.name || '',
      cal: parseFloat(food.cal) || 0,
      carb: parseFloat(food.carb) || 0,
      fat: parseFloat(food.fat) || 0,
      protein: parseFloat(food.protein) || 0,
      img: food.img || null, // This will be used with seconde_url on frontend
      ingredient: food.ingredient || '',
      source: 'foods' as const,
      isUserFood: false
    }));

    // Combine and sort results (user foods first, then by name)
    const allResults = [
      ...userFoodResults,
      ...globalFoodResults
    ].sort((a, b) => {
      // User foods first
      if (a.isUserFood && !b.isUserFood) return -1;
      if (!a.isUserFood && b.isUserFood) return 1;
      // Then sort by name
      return a.name.localeCompare(b.name, 'th');
    });

    res.json({
      success: true,
      data: {
        userFoods: userFoodResults,
        globalFoods: globalFoodResults,
        total: allResults.length,
        userFoodsCount: userFoodResults.length,
        globalFoodsCount: globalFoodResults.length,
        searchTerm: searchTerm
      }
    });

  } catch (error) {
    console.error('Error searching foods:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการค้นหาอาหาร',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Add new user food
 */
export const addUserFood = async (req: Request & { user?: any; file?: Express.Multer.File }, res: Response): Promise<void> => {
  try {
    const { name, calories, carbs, fat, protein, ingredient, src } = req.body;
    const user_id = req.user?.id;
    const uploadedFile = req.file;

    // Validation
    if (!name || !name.trim()) {
      res.status(400).json({
        success: false,
        message: 'กรุณาระบุชื่ออาหาร'
      });
      return;
    }

    if (!user_id) {
      res.status(401).json({
        success: false,
        message: 'กรุณาเข้าสู่ระบบ'
      });
      return;
    }
     
    // Prepare food data
    const foodData: UserFoodData = {
      name: name.trim(),
      cal: parseFloat(calories) || 0,
      carb: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
      protein: parseFloat(protein) || 0,
      ingredient: ingredient || '',
      user_id: user_id,
      src: src || 'user' // Default to 'user' if not provided
    };
    
    // Add image if uploaded
    if (uploadedFile) {
      foodData.img = `/images/user_foods/${uploadedFile.filename}`;
    }

    // Insert into database
    const [insertId] = await db('user_food').insert(foodData);

    // Get the created food
    const createdFood = await db('user_food')
      .where('id', insertId)
      .first();

    res.status(201).json({
      success: true,
      message: 'เพิ่มเมนูอาหารใหม่เรียบร้อยแล้ว',
      data: createdFood
    });

  } catch (error) {
    console.error('Error adding user food:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
