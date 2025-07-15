import db from '../db_config';

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

// ดึงบทความทั้งหมดที่เผยแพร่แล้ว
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

// ดึงบทความโดย ID
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

// ดึงบทความแนะนำ (featured)
export const getFeaturedArticles = async (limit: number = 1) => {
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
    console.error('Error fetching featured articles:', error);
    throw error;
  }
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

