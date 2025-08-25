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
      .select('id', 'name', 'description', 'img')
      .orderBy('id', 'desc');

    // Add base_url to image path
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    
    const formattedPlans = plans.map(plan => ({
      ...plan,
      img: plan.img ? `${baseUrl}${plan.img}` : null
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
      plan: typeof plan.plan === 'string' ? JSON.parse(plan.plan) : plan.plan,
      img: plan.img ? `${process.env.BASE_URL || `${req.protocol}://${req.get('host')}`}${plan.img}` : null
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


export const setCurrentFoodPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { food_plan_id } = req.body;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        error: 'ไม่พบข้อมูลผู้ใช้' 
      });
      return;
    }

    if (!food_plan_id) {
      res.status(400).json({ 
        success: false, 
        error: 'กรุณาระบุ ID ของแผนอาหาร' 
      });
      return;
    }

    // Check if the food plan exists and belongs to user
    const foodPlan = await db('user_food_plans')
      .where({ id: food_plan_id, user_id: userId })
      .first();

    if (!foodPlan) {
      res.status(404).json({ 
        success: false, 
        error: 'ไม่พบแผนอาหารที่ระบุ' 
      });
      return;
    }

    // Check if user already has a current plan
    const existingCurrentPlan = await db('user_food_plan_using')
      .where({ user_id: userId })
      .first();

    if (existingCurrentPlan) {
      // Update existing record
      await db('user_food_plan_using')
        .where({ user_id: userId })
        .update({
          food_plan_id: food_plan_id,
          start_date: db.fn.now(),
          is_repeat: false
        });
    } else {
      // Create new record
      await db('user_food_plan_using').insert({
        food_plan_id: food_plan_id,
        user_id: userId,
        start_date: db.fn.now(),
        is_repeat: false
      });
    }

    res.json({
      success: true,
      message: 'ตั้งเป็นแผนปัจจุบันเรียบร้อยแล้ว',
      data: {
        food_plan_id,
        user_id: userId
      }
    });

  } catch (error) {
    console.error('Error setting current food plan:', error);
    res.status(500).json({ 
      success: false, 
      error: 'เกิดข้อผิดพลาดในการตั้งแผนปัจจุบัน' 
    });
  }
};


export const getCurrentFoodPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        error: 'ไม่พบข้อมูลผู้ใช้' 
      });
      return;
    }

    // Get current food plan with plan details
    const currentPlanUsage = await db('user_food_plan_using as ufpu')
      .join('user_food_plans as ufp', 'ufpu.food_plan_id', 'ufp.id')
      .where('ufpu.user_id', userId)
      .select(
        'ufpu.*',
        'ufp.name',
        'ufp.description',
        'ufp.plan as plan_data',
        'ufp.img'
      )
      .first();

    if (!currentPlanUsage) {
      res.status(404).json({ 
        success: false, 
        error: 'ไม่พบแผนปัจจุบัน' 
      });
      return;
    }

    // Parse plan data if it's a string
    let planData = currentPlanUsage.plan_data;
    if (typeof planData === 'string') {
      try {
        planData = JSON.parse(planData);
      } catch (e) {
        console.error('Error parsing plan data:', e);
      }
    }

    res.json({
      success: true,
      message: 'ดึงข้อมูลแผนปัจจุบันสำเร็จ',
      data: {
        ...currentPlanUsage,
        plan_data: planData
      }
    });

  } catch (error) {
    console.error('Error getting current food plan:', error);
    res.status(500).json({ 
      success: false, 
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลแผนปัจจุบัน' 
    });
  }
};

// Get active current food plan ID only (without join)
export const knowCurrentFoodPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        error: 'ไม่พบข้อมูลผู้ใช้' 
      });
      return;
    }

    // Get only the active food plan ID from user_food_plan_using
    const currentPlanUsage = await db('user_food_plan_using')
      .where('user_id', userId)
      .select('food_plan_id', 'start_date', 'is_repeat')
      .first();

    if (!currentPlanUsage) {
      res.status(404).json({ 
        success: false, 
        error: 'ไม่พบแผนปัจจุบัน' 
      });
      return;
    }

    res.json({
      success: true,
      message: 'ดึงข้อมูลแผนปัจจุบันสำเร็จ',
      data: {
        food_plan_id: currentPlanUsage.food_plan_id,
        start_date: currentPlanUsage.start_date,
        is_repeat: currentPlanUsage.is_repeat
      }
    });

  } catch (error) {
    console.error('Error getting current food plan ID:', error);
    res.status(500).json({ 
      success: false, 
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลแผนปัจจุบัน' 
    });
  }
};

// Set plan settings (start date and auto loop)
export const setPlanSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { food_plan_id, start_date, auto_loop } = req.body;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        error: 'ไม่พบข้อมูลผู้ใช้' 
      });
      return;
    }

    if (!start_date) {
      res.status(400).json({ 
        success: false, 
        error: 'กรุณาระบุวันเริ่มต้นแผน' 
      });
      return;
    }

    if (!food_plan_id) {
      res.status(400).json({ 
        success: false, 
        error: 'กรุณาเลือกแผนอาหาร' 
      });
      return;
    }

    // Check if the food plan exists and belongs to user
    const foodPlan = await db('user_food_plans')
      .where({ id: food_plan_id, user_id: userId })
      .first();

    if (!foodPlan) {
      res.status(404).json({ 
        success: false, 
        error: 'ไม่พบแผนอาหารที่ระบุ' 
      });
      return;
    }

    // Update plan settings in user_food_plans table
    await db('user_food_plans')
      .where({ id: food_plan_id, user_id: userId })
      .update({
        plan_start_date: start_date,
        is_repeat: auto_loop || false
      });

    // Also update current plan in user_food_plan_using for backward compatibility
    const existingCurrentPlan = await db('user_food_plan_using')
      .where({ user_id: userId })
      .first();

    if (existingCurrentPlan) {
      // Update existing record
      await db('user_food_plan_using')
        .where({ user_id: userId })
        .update({
          food_plan_id: food_plan_id,
          start_date: start_date,
          is_repeat: auto_loop || false
        });
    } else {
      // Create new recordป
      await db('user_food_plan_using').insert({
        food_plan_id: food_plan_id,
        user_id: userId,
        start_date: start_date,
        is_repeat: auto_loop || false
      });
    }

    res.status(200).json({
      success: true,
      message: 'บันทึกการตั้งค่าสำเร็จ',
      data: {
        food_plan_id: food_plan_id,
        start_date: start_date,
        auto_loop: auto_loop || false
      }
    });

  } catch (error) {
    console.error('Error setting plan settings:', error);
    res.status(500).json({ 
      success: false, 
      error: 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า' 
    });
  }
};

// Get plan settings (start date and auto loop)
export const getPlanSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      console.log('No userId found, returning 401');
      res.status(401).json({ 
        success: false, 
        error: 'ไม่พบข้อมูลผู้ใช้' 
      });
      return;
    }

    // Helper function to convert date to Bangkok timezone
    const toBangkokDate = (date: string | Date) => {
      if (!date) return null;
      
      try {
        let d: Date;
        
        // Handle different date formats
        if (typeof date === 'string') {
          // If it's already in YYYY-MM-DD format, just return it
          if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return date;
          }
          
          // Parse the date string
          d = new Date(date);
        } else {
          d = date;
        }
        
        // Check if date is valid
        if (isNaN(d.getTime())) {
          console.warn('⚠️ Invalid date parsed, using current date');
          d = new Date();
        }
        
        // Convert to Bangkok timezone (UTC+7)
        const bangkokTime = new Date(d.getTime() + (7 * 60 * 60 * 1000));
        return bangkokTime.toISOString().split('T')[0]; // Return only YYYY-MM-DD
        
      } catch (error) {
        console.warn('⚠️ Error parsing date, using current date:', error);
        const now = new Date();
        const bangkokNow = new Date(now.getTime() + (7 * 60 * 60 * 1000));
        return bangkokNow.toISOString().split('T')[0];
      }
    };

    // First check if user has a current active plan
    const currentPlan = await db('user_food_plan_using')
      .where('user_id', userId)
      .first();

    if (!currentPlan) {
      console.log('No current plan found, returning default');
      res.status(200).json({
        success: true,
        message: 'ดึงการตั้งค่าสำเร็จ',
        data: {
          food_plan_id: null,
          start_date: new Date().toISOString().split('T')[0],
          auto_loop: false
        }
      });
      return;
    }

    // Get plan settings from user_food_plans table
    const planSettings = await db('user_food_plans')
      .where({ id: currentPlan.food_plan_id, user_id: userId })
      .select('id', 'plan_start_date', 'is_repeat')
      .first();

    if (!planSettings) {
      console.log('Plan not found, returning current plan data');
      res.status(200).json({
        success: true,
        message: 'ดึงการตั้งค่าสำเร็จ',
        data: {
          food_plan_id: currentPlan.food_plan_id,
          start_date: toBangkokDate(currentPlan.start_date) || new Date().toISOString().split('T')[0],
          auto_loop: currentPlan.is_repeat || false
        }
      });
      return;
    }

    console.log('Settings found, returning plan data');
    const bangkokStartDate = toBangkokDate(planSettings.plan_start_date) || toBangkokDate(currentPlan.start_date) || new Date().toISOString().split('T')[0];
    
    res.status(200).json({
      success: true,
      message: 'ดึงการตั้งค่าสำเร็จ',
      data: {
        food_plan_id: planSettings.id,
        start_date: bangkokStartDate,
        auto_loop: planSettings.is_repeat || false
      }
    });

  } catch (error) {
    console.error('Error getting plan settings:', error);
    res.status(500).json({ 
      success: false, 
      error: 'เกิดข้อผิดพลาดในการดึงการตั้งค่า' 
    });
  }
};
