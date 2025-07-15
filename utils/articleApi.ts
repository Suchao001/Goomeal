import axios from 'axios';
import { blog_url, base_url } from '../config';

// Interface สำหรับ Article
export interface Article {
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

// Interface สำหรับ Tag
export interface Tag {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

// Interface สำหรับ API Response
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ดึงบทความทั้งหมด
export const fetchArticles = async (): Promise<Article[]> => {
  try {
    const response = await axios.get<ApiResponse<Article[]>>(`${base_url}/api/articles`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch articles');
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }
};

// ดึงบทความแนะนำ
export const fetchFeaturedArticles = async (limit: number = 3): Promise<Article[]> => {
  try {
    const response = await axios.get<ApiResponse<Article[]>>(`${base_url}/api/articles/featured?limit=${limit}`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch featured articles');
  } catch (error) {
    console.error('Error fetching featured articles:', error);
    throw error;
  }
};

// ดึงบทความโดย ID
export const fetchArticleById = async (id: number): Promise<Article | null> => {
  try {
    const response = await axios.get<ApiResponse<Article>>(`${base_url}/api/articles/${id}`);
    if (response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching article by ID:', error);
    throw error;
  }
};

// ดึงบทความตาม tag
export const fetchArticlesByTag = async (tagName: string): Promise<Article[]> => {
  try {
    const response = await axios.get<ApiResponse<Article[]>>(`${base_url}/api/articles/tag/${encodeURIComponent(tagName)}`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch articles by tag');
  } catch (error) {
    console.error('Error fetching articles by tag:', error);
    throw error;
  }
};

// ดึง tags ทั้งหมด
export const fetchAllTags = async (): Promise<Tag[]> => {
  try {
    const response = await axios.get<ApiResponse<Tag[]>>(`${base_url}/api/tags`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch tags');
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }
};

// สร้าง URL สำหรับบทความ (สำหรับการเปิดใน browser)
export const generateArticleUrl = (articleId: number): string => {
  return `${blog_url}/article/${articleId}/view`;
};
