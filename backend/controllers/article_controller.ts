import db from '../db_config';
import { yearOfBirthToAge } from '../utils/ageCal';


// Interface สำหรับ Article
interface Article {
  id: number;
  title: string;
  img?: string;
  publish_date?: string;
  status: 'pending' | 'release';
  content?: string;
  excerpt_content?: string;
  created_at?: string;
  updated_at?: string;
  tags?: string[];
}

const getUserInfo = async (userId: number) => {
  try {
    const user = await db('users').where({ id: userId }).first();
    if (!user) {
      throw new Error('User not found');
    }
    return {
      age: user.age ? yearOfBirthToAge(user.age) : null,
      weight: user.weight,
      height: user.height,
      gender: user.gender,
      body_fat: user.body_fat,
      target_goal: user.target_goal,
      target_weight: user.target_weight,
      activity_level: user.activity_level,
      additional_requirements: user.additional_requirements,
      dietary_restrictions: user.dietary_restrictions ? user.dietary_restrictions.split(',').map((r: string) => r.trim()) : [],
      eating_type: user.eating_type

    };
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw error;
  }
};


export const getArticles = async () => {
  try {
    const articles = await db
      .select([
        'eb.id',
        'eb.title',
        'eb.img',
        'eb.publish_date',
        'eb.status',
        'eb.content',
        'eb.excerpt_content',
        'eb.created_at',
        'eb.updated_at',
        db.raw('GROUP_CONCAT(t.name) as tags')
      ])
      .from('eating_blog as eb')
      .leftJoin('post_tag as pt', 'eb.id', 'pt.post_id')
      .leftJoin('tags as t', 'pt.tag_id', 't.id')
      .where('eb.status', 'release')
      .groupBy('eb.id')
      .orderBy('eb.publish_date', 'desc');
    
    // แปลง tags จาก string เป็น array
    const processedArticles = articles.map(article => ({
      ...article,
      tags: article.tags ? article.tags.split(',') : []
    }));
    
    return processedArticles;
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }
};


export const getArticleById = async (id: number) => {
  try {
    const articles = await db
      .select([
        'eb.id',
        'eb.title',
        'eb.img',
        'eb.publish_date',
        'eb.status',
        'eb.content',
        'eb.excerpt_content',
        'eb.created_at',
        'eb.updated_at',
        db.raw('GROUP_CONCAT(t.name) as tags')
      ])
      .from('eating_blog as eb')
      .leftJoin('post_tag as pt', 'eb.id', 'pt.post_id')
      .leftJoin('tags as t', 'pt.tag_id', 't.id')
      .where('eb.id', id)
      .where('eb.status', 'release')
      .groupBy('eb.id')
      .first();
    
    if (!articles) {
      return null;
    }
    
    return {
      ...articles,
      tags: articles.tags ? articles.tags.split(',') : []
    };
  } catch (error) {
    console.error('Error fetching article by ID:', error);
    throw error;
  }
};

// ดึงบทความแนะนำทั่วไป (ไม่ต้องใช้ข้อมูลผู้ใช้)
export const getGenericFeaturedArticles = async (limit: number = 3) => {
  try {
    const articles = await db
      .select([
        'eb.id',
        'eb.title',
        'eb.img',
        'eb.publish_date',
        'eb.status',
        'eb.content',
        'eb.excerpt_content',
        'eb.created_at',
        'eb.updated_at',
        db.raw('GROUP_CONCAT(t.name) as tags')
      ])
      .from('eating_blog as eb')
      .leftJoin('post_tag as pt', 'eb.id', 'pt.post_id')
      .leftJoin('tags as t', 'pt.tag_id', 't.id')
      .where('eb.status', 'release')
      .groupBy('eb.id')
      .orderBy('eb.publish_date', 'desc')
      .limit(limit);
    
    const processedArticles = articles.map(article => ({
      ...article,
      tags: article.tags ? article.tags.split(',') : []
    }));
    
    return processedArticles;
  } catch (error) {
    console.error('Error fetching generic featured articles:', error);
    throw error;
  }
};

// ดึงบทความแนะนำ (featured) โดยใช้ข้อมูลผู้ใช้
export const getFeaturedArticles = async (userId: number, limit: number = 3) => {
  try {
    // ดึงข้อมูลผู้ใช้
    const userInfo = await getUserInfo(userId);
    
    // สร้าง keywords สำหรับการค้นหาตามข้อมูลผู้ใช้
    const searchKeywords = generateSearchKeywords(userInfo);
    
    // Query หลัก: ค้นหาบทความที่เกี่ยวข้องกับข้อมูลผู้ใช้
    let query = db
      .select([
        'eb.id',
        'eb.title',
        'eb.img',
        'eb.publish_date',
        'eb.status',
        'eb.content',
        'eb.excerpt_content',
        'eb.created_at',
        'eb.updated_at',
        db.raw('GROUP_CONCAT(t.name) as tags'),
        db.raw('0 as relevance_score') // เริ่มต้นด้วยคะแนน 0
      ])
      .from('eating_blog as eb')
      .leftJoin('post_tag as pt', 'eb.id', 'pt.post_id')
      .leftJoin('tags as t', 'pt.tag_id', 't.id')
      .where('eb.status', 'release')
      .groupBy('eb.id');

    // ถ้ามี keywords ให้ค้นหาตาม title, content, หรือ tags
    // ถ้ามี keywords ให้ค้นหาตาม tags เท่านั้น
if (searchKeywords.length > 0) {
  const searchConditions = searchKeywords.map(keyword => {
    return db.raw(`LOWER(t.name) LIKE LOWER(?)`, [`%${keyword}%`]);
  });
  
  // ใช้ OR เพื่อให้ค้นหาบทความที่มี tag ใดๆ ที่ตรงกับ keyword
  query = query.where(function() {
    searchConditions.forEach((condition, index) => {
      if (index === 0) {
        this.where(condition);
      } else {
        this.orWhere(condition);
      }
    });
  });
}

    let articles = await query
      .orderBy('eb.publish_date', 'desc')
      .limit(limit);

    // ถ้าไม่พบบทความที่เกี่ยวข้อง ให้ดึงบทความยอดนิยมมาแทน
    if (articles.length === 0) {
      articles = await db
        .select([
          'eb.id',
          'eb.title',
          'eb.img',
          'eb.publish_date',
          'eb.status',
          'eb.content',
          'eb.excerpt_content',
          'eb.created_at',
          'eb.updated_at',
          db.raw('GROUP_CONCAT(t.name) as tags'),
          db.raw('0 as relevance_score')
        ])
        .from('eating_blog as eb')
        .leftJoin('post_tag as pt', 'eb.id', 'pt.post_id')
        .leftJoin('tags as t', 'pt.tag_id', 't.id')
        .where('eb.status', 'release')
        .groupBy('eb.id')
        .orderBy('eb.publish_date', 'desc')
        .limit(limit);
    }

    // คำนวณคะแนนความเกี่ยวข้องและเรียงลำดับ
    const processedArticles = articles
      .map(article => {
        const relevanceScore = calculateRelevanceScore(article, userInfo, searchKeywords);
        return {
          ...article,
          tags: article.tags ? article.tags.split(',') : [],
          relevance_score: relevanceScore
        };
      })
      .sort((a, b) => b.relevance_score - a.relevance_score) // เรียงจากคะแนนสูงไปต่ำ
      .slice(0, limit); // เอาแค่จำนวนที่ต้องการ

    return processedArticles;
  } catch (error) {
    console.error('Error fetching featured articles:', error);
    throw error;
  }
};

// ฟังก์ชันสร้าง keywords สำหรับค้นหาตามข้อมูลผู้ใช้
const generateSearchKeywords = (userInfo: any): string[] => {
  const keywords: string[] = [];
  
  // Keywords จาก eating_type
  if (userInfo.eating_type) {
    console.log('User eating type:', userInfo.eating_type);
    switch (userInfo.eating_type) {
      case 'vegan':
        keywords.push('vegan', 'วีแกน', 'พืช', 'ไม่ทานเนื้อ', 'ผัก', 'ธัญพืช');
        break;
      case 'vegetarian':
        keywords.push('vegetarian', 'มังสวิรัติ', 'ผัก', 'ไข่', 'นม', 'ผลไม้');
        break;
      case 'keto':
        keywords.push('keto', 'ketogenic', 'คีโต', 'ไขมันสูง', 'คาร์บต่ำ', 'โปรตีน');
        break;
      case 'omnivore':
        keywords.push('omnivore', 'เนื้อ', 'ผัก', 'สมดุล', 'ครบถ้วน');
        break;
    }
  }
  
  // Keywords จาก target_goal
  if (userInfo.target_goal) {
    switch (userInfo.target_goal) {
      case 'decrease':
        keywords.push('ลดน้ำหนัก', 'weight loss', 'แคลอรี่ต่ำ', 'ไขมันต่ำ', 'ลดความอ้วน', 'ดีท็อกซ์');
        break;
      case 'increase':
        keywords.push('เพิ่มน้ำหนัก', 'weight gain', 'สร้างกล้าม', 'โปรตีนสูง', 'พลังงาน', 'มวลกล้ามเนื้อ');
        break;
      case 'healthy':
        keywords.push('สุขภาพ', 'healthy', 'สมดุล', 'โภชนาการ', 'clean eating', 'wellness');
        break;
    }
  }
  
  // Keywords จาก dietary_restrictions
  if (userInfo.dietary_restrictions && userInfo.dietary_restrictions.length > 0) {
    userInfo.dietary_restrictions.forEach((restriction: string) => {
      keywords.push(restriction, 'แพ้', 'หลีกเลี่ยง', 'ไม่ทาน');
    });
  }
  
  // Keywords จาก age group
  if (userInfo.age) {
    if (userInfo.age < 30) {
      keywords.push('วัยรุ่น', 'หนุ่มสาว', 'เด็กหนุ่ม', 'สาวน้อย');
    } else if (userInfo.age >= 30 && userInfo.age < 50) {
      keywords.push('วัยทำงาน', 'ผู้ใหญ่', 'ครอบครัว');
    } else {
      keywords.push('ผู้สูงอายุ', 'วัยเกษียณ', 'สุขภาพผู้ใหญ่');
    }
  }
  
  // Keywords จาก gender
  if (userInfo.gender) {
    keywords.push(userInfo.gender === 'male' ? 'ผู้ชาย' : 'ผู้หญิง');
  }
  
  return keywords;
};

// ฟังก์ชันคำนวณคะแนนความเกี่ยวข้อง
const calculateRelevanceScore = (article: any, userInfo: any, searchKeywords: string[]): number => {
  let score = 0;
  
  const title = (article.title || '').toLowerCase();
  const content = (article.content || '').toLowerCase();
  const excerptContent = (article.excerpt_content || '').toLowerCase();
  // Convert tags string to array of lowercase tags
  const tags = article.tags ? article.tags.split(',').map((tag: string) => tag.toLowerCase().trim()) : [];
  
  // คะแนนจาก keywords ที่ปรากฏใน title (คะแนนสูงสุด)
  searchKeywords.forEach(keyword => {
    const lowerKeyword = keyword.toLowerCase();
    if (title.includes(lowerKeyword)) {
      score += 10;
    }
    if (content.includes(lowerKeyword)) {
      score += 5;
    }
    if (excerptContent.includes(lowerKeyword)) {
      score += 7;
    }
    if (tags.some((tag: string) => tag.includes(lowerKeyword))) {
      score += 8;
    }
  });
  
  // คะแนนพิเศษสำหรับบทความใหม่
  const publishDate = new Date(article.publish_date);
  const daysSincePublish = Math.floor((Date.now() - publishDate.getTime()) / (1000 * 60 * 60 * 24));
  if (daysSincePublish <= 7) {
    score += 3; // บทความใหม่ 7 วัน
  } else if (daysSincePublish <= 30) {
    score += 1; // บทความใหม่ 30 วัน
  }
  
  return score;
};

// ดึงบทความตาม tag
export const getArticlesByTag = async (tagName: string) => {
  try {
    const articles = await db
      .select([
        'eb.id',
        'eb.title',
        'eb.img',
        'eb.publish_date',
        'eb.status',
        'eb.content',
        'eb.excerpt_content',
        'eb.created_at',
        'eb.updated_at',
        db.raw('GROUP_CONCAT(DISTINCT t2.name) as tags')
      ])
      .from('eating_blog as eb')
      .innerJoin('post_tag as pt', 'eb.id', 'pt.post_id')
      .innerJoin('tags as t', 'pt.tag_id', 't.id')
      .leftJoin('post_tag as pt2', 'eb.id', 'pt2.post_id')
      .leftJoin('tags as t2', 'pt2.tag_id', 't2.id')
      .where('eb.status', 'release')
      .where('t.name', tagName)
      .groupBy('eb.id')
      .orderBy('eb.publish_date', 'desc');
    
    const processedArticles = articles.map(article => ({
      ...article,
      tags: article.tags ? article.tags.split(',') : []
    }));
    
    return processedArticles;
  } catch (error) {
    console.error('Error fetching articles by tag:', error);
    throw error;
  }
};

// ดึง tags ทั้งหมด
export const getAllTags = async () => {
  try {
    const tags = await db
      .select('*')
      .from('tags')
      .orderBy('name');
    
    return tags;
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }
}; 
