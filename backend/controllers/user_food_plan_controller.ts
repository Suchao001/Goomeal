import { Request, Response } from 'express';
import db from '../db_config';

// Create user food plan
export const createUserFoodPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, plan } = req.body;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        error: 'ไม่พบข้อมูลผู้ใช้' 
      });
      return;
    }

    if (!name || !plan) {
      res.status(400).json({ 
        success: false, 
        error: 'กรุณาระบุชื่อแผนและข้อมูลแผนอาหาร' 
      });
      return;
    }

    // Handle image upload
    let imagePath = null;
    if (req.file) {
      imagePath = `/images/user_food_plans/${req.file.filename}`;
    }

    const [insertId] = await db('user_food_plans').insert({
      name,
      description: description || null,
      plan: JSON.stringify(plan),
      img: imagePath,
      user_id: userId
    });

    res.status(201).json({
      success: true,
      message: 'บันทึกแผนอาหารเรียบร้อยแล้ว',
      data: {
        id: insertId,
        name,
        description,
        plan,
        img: imagePath,
        user_id: userId
      }
    });

  } catch (error) {
    console.error('Error creating user food plan:', error);
    res.status(500).json({ 
      success: false, 
      error: 'เกิดข้อผิดพลาดในการบันทึกแผนอาหาร' 
    });
  }
};

// Get user food plans
export const getUserFoodPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        error: 'ไม่พบข้อมูลผู้ใช้' 
      });
      return;
    }

    const plans = await db('user_food_plans')
      .where('user_id', userId)
      .orderBy('id', 'desc');

    const formattedPlans = plans.map(row => ({
      ...row,
      plan: typeof row.plan === 'string' ? JSON.parse(row.plan) : row.plan
    }));

    res.json({
      success: true,
      data: formattedPlans
    });

  } catch (error) {
    console.error('Error fetching user food plans:', error);
    res.status(500).json({ 
      success: false, 
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลแผนอาหาร' 
    });
  }
};

// Get user food plan by ID
export const getUserFoodPlanById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        error: 'ไม่พบข้อมูลผู้ใช้' 
      });
      return;
    }

    const plan = await db('user_food_plans')
      .where({ id, user_id: userId })
      .first();
      
    if (!plan) {
      res.status(404).json({ 
        success: false, 
        error: 'ไม่พบแผนอาหารที่ระบุ' 
      });
      return;
    }

    const formattedPlan = {
      ...plan,
      plan: typeof plan.plan === 'string' ? JSON.parse(plan.plan) : plan.plan
    };

    res.json({
      success: true,
      data: formattedPlan
    });

  } catch (error) {
    console.error('Error fetching user food plan by ID:', error);
    res.status(500).json({ 
      success: false, 
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลแผนอาหาร' 
    });
  }
};

// Update user food plan
export const updateUserFoodPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, plan } = req.body;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        error: 'ไม่พบข้อมูลผู้ใช้' 
      });
      return;
    }

    // Check if plan exists and belongs to user
    const existingPlan = await db('user_food_plans')
      .where({ id, user_id: userId })
      .first();
      
    if (!existingPlan) {
      res.status(404).json({ 
        success: false, 
        error: 'ไม่พบแผนอาหารที่ระบุ' 
      });
      return;
    }

    // Handle image upload
    let imagePath = existingPlan.img; // Keep existing image if no new image
    if (req.file) {
      imagePath = `/images/user_food_plans/${req.file.filename}`;
    }

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (plan !== undefined) updateData.plan = JSON.stringify(plan);
    if (imagePath !== existingPlan.img) updateData.img = imagePath;

    // Update the plan
    await db('user_food_plans')
      .where({ id, user_id: userId })
      .update(updateData);

    res.json({
      success: true,
      message: 'อัพเดทแผนอาหารเรียบร้อยแล้ว',
      data: {
        id: parseInt(id),
        name: name || existingPlan.name,
        description: description !== undefined ? description : existingPlan.description,
        plan: plan || JSON.parse(existingPlan.plan),
        img: imagePath,
        user_id: userId
      }
    });

  } catch (error) {
    console.error('Error updating user food plan:', error);
    res.status(500).json({ 
      success: false, 
      error: 'เกิดข้อผิดพลาดในการอัพเดทแผนอาหาร' 
    });
  }
};

// Delete user food plan
export const deleteUserFoodPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        error: 'ไม่พบข้อมูลผู้ใช้' 
      });
      return;
    }

    // Check if plan exists and belongs to user
    const existingPlan = await db('user_food_plans')
      .where({ id, user_id: userId })
      .first();
      
    if (!existingPlan) {
      res.status(404).json({ 
        success: false, 
        error: 'ไม่พบแผนอาหารที่ระบุ' 
      });
      return;
    }

    // Delete the plan
    await db('user_food_plans')
      .where({ id, user_id: userId })
      .del();

    res.json({
      success: true,
      message: 'ลบแผนอาหารเรียบร้อยแล้ว'
    });

  } catch (error) {
    console.error('Error deleting user food plan:', error);
    res.status(500).json({ 
      success: false, 
      error: 'เกิดข้อผิดพลาดในการลบแผนอาหาร' 
    });
  }
};
