import { Request, Response } from 'express';
import db from '../db_config';
import path from 'path';
import fs from 'fs';

interface UserFoodData {
  name: string;
  cal: number;
  carb: number;
  fat: number;
  protein: number;
  img?: string | null;
  user_id: number;
  ingredient: string;
  src?: string;
  serving?: string;
  created_at?: string;
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
  src?: string; // 'user' or 'ai'
  serving?: string;
  createdAt?: any;
}

/**
 * Get user's own foods only
 */
export const getUserFoods = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const { query, limit = 50, src } = req.query;
    const user_id = req.user?.id;

    if (!user_id) {
      res.status(401).json({
        success: false,
        message: 'กรุณาเข้าสู่ระบบ'
      });
      return;
    }

    const searchTerm = query as string || '';
    const limitNum = parseInt(limit as string) || 50;
    const sourceFilter = src as string; // 'user' or 'ai' or undefined (all)

    let userFoodsQuery = db('user_food')
      .select(
        'id',
        'name', 
        'cal',
        'carb',
        'fat',
        'protein',
        'img',
        'ingredient',
        'serving',
        'src',
        'created_at',
      )
      .where('user_id', user_id)
      .orderBy('created_at', 'desc'); // Show newest first

    // Apply source filter if provided
    if (sourceFilter && (sourceFilter === 'user' || sourceFilter === 'ai')) {
      userFoodsQuery = userFoodsQuery.where('src', sourceFilter);
    }

    // Apply search filter if query is provided
    if (searchTerm.trim()) {
      userFoodsQuery = userFoodsQuery.where(function() {
        this.where('name', 'like', `%${searchTerm}%`)
            .orWhere('ingredient', 'like', `%${searchTerm}%`);
      });
    }

    // Execute query
    const userFoods = await userFoodsQuery.limit(limitNum);

    // Transform results
    const userFoodResults: FoodSearchResult[] = userFoods.map(food => ({
      id: `user_${food.id}`,
      name: food.name || '',
      cal: parseFloat(food.cal) || 0,
      carb: parseFloat(food.carb) || 0,
      fat: parseFloat(food.fat) || 0,
      protein: parseFloat(food.protein) || 0,
      img: food.img || null, // Already has full path /images/user_foods/...
      ingredient: food.ingredient || '',
      serving: food.serving || '',
      source: 'user_food' as const,
      isUserFood: true,
      src: food.src || 'user', // Add src information
      createdAt: food.created_at,
   
    }));

    res.json({
      success: true,
      data: {
        userFoods: userFoodResults,
        total: userFoodResults.length,
        searchTerm: searchTerm,
        sourceFilter: sourceFilter,
        userFoodsBySource: {
          user: userFoodResults.filter(f => f.src === 'user').length,
          ai: userFoodResults.filter(f => f.src === 'ai').length
        }
      }
    });

  } catch (error) {
    console.error('Error getting user foods:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลอาหาร',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

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
        'ingredient',
        'serving'
      )
      .where('user_id', user_id).orderBy('created_at', 'desc'); 

    let globalFoodsQuery = db('foods')
      .select(
        'id',
        'name',
        'cal', 
        'carb',
        'fat',
        'protein',
        'img',
        'ingredient',
        'serving'
      )
      .where((builder) => {
        builder.where('is_delete', false).orWhereNull('is_delete');
      });

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
      serving: food.serving || '',
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
      serving: food.serving || '',
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
 * Delete user's own food
 */
export const deleteUserFood = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      res.status(401).json({
        success: false,
        message: 'กรุณาเข้าสู่ระบบ'
      });
      return;
    }

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'กรุณาระบุ ID ของอาหาร'
      });
      return;
    }

    // Check if food exists and belongs to user
    const food = await db('user_food')
      .where('id', id)
      .where('user_id', user_id)
      .first();

    if (!food) {
      res.status(404).json({
        success: false,
        message: 'ไม่พบอาหารที่ต้องการลบ หรือคุณไม่มีสิทธิ์ลบอาหารนี้'
      });
      return;
    }

    // Delete image file if exists
    if (food.img) {
      const imagePath = path.join(__dirname, '..', 'images', 'user_foods', path.basename(food.img));
      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log('Deleted image file:', imagePath);
        }
      } catch (imageError) {
        console.error('Error deleting image file:', imageError);
        // Continue with database deletion even if image deletion fails
      }
    }

    // Delete the food
    const deletedCount = await db('user_food')
      .where('id', id)
      .where('user_id', user_id)
      .del();

    if (deletedCount === 0) {
      res.status(404).json({
        success: false,
        message: 'ไม่สามารถลบอาหารได้'
      });
      return;
    }

    res.json({
      success: true,
      message: 'ลบอาหารเรียบร้อยแล้ว',
      data: { deletedId: id }
    });

  } catch (error) {
    console.error('Error deleting user food:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบอาหาร',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Add new user food
 */
export const addUserFood = async (req: Request & { user?: any; file?: Express.Multer.File }, res: Response): Promise<void> => {
  try {
    const { name, calories, carbs, fat, protein, ingredient, src , serving } = req.body;
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

    const trimmedName = name.trim();

    // Prevent duplicate menu names for the same user
    const existingFood = await db('user_food')
      .where('user_id', user_id)
      .whereRaw('LOWER(name) = ?', trimmedName.toLowerCase())
      .first();

    if (existingFood) {
      res.status(409).json({
        success: false,
        message: 'มีเมนูอาหารนี้อยู่ในระบบแล้ว'
      });
      return;
    }

    // Prepare food data
    const foodData: UserFoodData = {
      name: trimmedName,
      cal: parseFloat(calories) || 0,
      carb: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
      protein: parseFloat(protein) || 0,
      ingredient: ingredient || '',
      user_id: user_id,
      src: src || 'user',
      serving: serving || '',
      created_at: new Date().toISOString().replace('T', ' ').replace('Z', '') 
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

/**
 * Update user food
 */
export const updateUserFood = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const foodId = req.params.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'ไม่พบข้อมูลผู้ใช้'
      });
      return;
    }

    if (!foodId) {
      res.status(400).json({
        success: false,
        message: 'ไม่พบ ID อาหาร'
      });
      return;
    }

    // Check if food exists and belongs to user
    const existingFood = await db('user_food')
      .where({ id: foodId, user_id: userId })
      .first();

    if (!existingFood) {
      res.status(404).json({
        success: false,
        message: 'ไม่พบเมนูอาหารที่ต้องการแก้ไข'
      });
      return;
    }

    // Handle image deletion request
    if (req.body.deleteImage === 'true' && existingFood.img) {
      const imagePath = path.join(__dirname, '..', 'images', 'user_foods', path.basename(existingFood.img));
      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log('Deleted old image file:', imagePath);
        }
      } catch (imageError) {
        console.error('Error deleting old image file:', imageError);
        // Continue with update even if image deletion fails
      }
    }

    // Prepare update data
    const updateData: Partial<UserFoodData> = {};

    // Update text fields if provided
    if (req.body.name) {
      const trimmedName = req.body.name.trim();

      if (!trimmedName) {
        res.status(400).json({
          success: false,
          message: 'กรุณาระบุชื่ออาหาร'
        });
        return;
      }

      const duplicateFood = await db('user_food')
        .where('user_id', userId)
        .whereRaw('LOWER(name) = ?', trimmedName.toLowerCase())
        .whereNot('id', existingFood.id)
        .first();

      if (duplicateFood) {
        res.status(409).json({
          success: false,
          message: 'มีเมนูอาหารนี้อยู่ในระบบแล้ว'
        });
        return;
      }

      updateData.name = trimmedName;
    }
    if (req.body.calories) updateData.cal = parseFloat(req.body.calories);
    if (req.body.carbs) updateData.carb = parseFloat(req.body.carbs);
    if (req.body.fat) updateData.fat = parseFloat(req.body.fat);
    if (req.body.protein) updateData.protein = parseFloat(req.body.protein);
    if (req.body.ingredient !== undefined) updateData.ingredient = req.body.ingredient;
    if (req.body.serving !== undefined) updateData.serving = req.body.serving;

    // Handle image upload if provided
    if (req.file) {
      // Delete old image if exists and new image is uploaded
      if (existingFood.img) {
        const oldImagePath = path.join(__dirname, '..', 'images', 'user_foods', path.basename(existingFood.img));
        try {
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
            console.log('Deleted old image file for replacement:', oldImagePath);
          }
        } catch (imageError) {
          console.error('Error deleting old image file:', imageError);
          // Continue with update even if old image deletion fails
        }
      }
      
      const imagePath = `/images/user_foods/${req.file.filename}`;
      updateData.img = imagePath;
    }

    // Handle explicit image removal
    if (req.body.deleteImage === 'true') {
      updateData.img = null;
    }

    // Validate numeric values
    if (updateData.cal !== undefined && (isNaN(updateData.cal) || updateData.cal < 0)) {
      res.status(400).json({
        success: false,
        message: 'ค่าแคลอรี่ไม่ถูกต้อง'
      });
      return;
    }

    if (updateData.carb !== undefined && (isNaN(updateData.carb) || updateData.carb < 0)) {
      res.status(400).json({
        success: false,
        message: 'ค่าคาร์โบไฮเดรตไม่ถูกต้อง'
      });
      return;
    }

    if (updateData.fat !== undefined && (isNaN(updateData.fat) || updateData.fat < 0)) {
      res.status(400).json({
        success: false,
        message: 'ค่าไขมันไม่ถูกต้อง'
      });
      return;
    }

    if (updateData.protein !== undefined && (isNaN(updateData.protein) || updateData.protein < 0)) {
      res.status(400).json({
        success: false,
        message: 'ค่าโปรตีนไม่ถูกต้อง'
      });
      return;
    }

    // Update the food
    await db('user_food')
      .where({ id: foodId, user_id: userId })
      .update(updateData);

    // Get updated food data
    const updatedFood = await db('user_food')
      .select('id', 'name', 'cal', 'carb', 'fat', 'protein', 'img', 'ingredient', 'src')
      .where({ id: foodId, user_id: userId })
      .first();

    // Transform result
    const result = {
      id: `user_${updatedFood.id}`,
      name: updatedFood.name,
      cal: updatedFood.cal,
      carb: updatedFood.carb,
      fat: updatedFood.fat,
      protein: updatedFood.protein,
      img: updatedFood.img,
      ingredient: updatedFood.ingredient || '',
      source: 'user_food' as const,
      isUserFood: true,
      src: updatedFood.src || 'user'
    };

    res.status(200).json({
      success: true,
      message: 'แก้ไขเมนูอาหารเรียบร้อยแล้ว',
      data: result
    });

  } catch (error) {
    console.error('Error updating user food:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
