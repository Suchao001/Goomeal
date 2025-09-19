import { Request, Response } from 'express';
import db from '../db_config';

interface GlobalFoodPlan {
  plan_id: number;
  plan_name: string;
  duration: number;
  description: string;
  created_at: string;
  image: string;
}

export const getGlobalFoodPlans = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    const offset = (page - 1) * limit;

    let query = db('global_food_plan')
      .select(
        'plan_id',
        'plan_name',
        'duration',
        'description',
        'created_at',
        'image'
      )
      .where({ is_delete: false });

    // Add search functionality
    if (search) {
      query = query.where(function() {
        this.where('plan_name', 'like', `%${search}%`)
            .orWhere('description', 'like', `%${search}%`);
      });
    }

    // Get total count for pagination
    const totalQuery = db('global_food_plan').where({ is_delete: false });
    if (search) {
      totalQuery.where(function() {
        this.where('plan_name', 'like', `%${search}%`)
            .orWhere('description', 'like', `%${search}%`);
      });
    }
    const [{ count }] = await totalQuery.count('* as count');
    const total = count as number;

    // Apply pagination and ordering
    const plans = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: plans,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      message: 'Global food plans fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching global food plans:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch global food plans',
      message: 'Internal server error'
    });
  }
};
