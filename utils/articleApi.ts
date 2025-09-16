import { BaseApiClient } from './api/baseClient';
import { blog_url } from '../config';


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


export interface Tag {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}


interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}


const apiClient = new BaseApiClient();


export const fetchArticles = async (): Promise<Article[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Article[]>>('/api/articles');
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch articles');
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }
};


export const fetchFeaturedArticles = async (limit: number = 3, userId?: string): Promise<Article[]> => {
  try {

    const response = await apiClient.get<ApiResponse<Article[]>>(
      `/api/articles/featured?limit=${limit}`
    );
    if (response.data.success) {
      console.log('✅ API response success, articles count:', response.data.data.length); 
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch featured articles');
  } catch (error) {
    console.error('Error fetching featured articles:', error);
    throw error;
  }
};


export const fetchArticleById = async (id: number): Promise<Article | null> => {
  try {
    const response = await apiClient.get(`/api/articles/${id}`) as { data: ApiResponse<Article> };
    if (response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching article by ID:', error);
    return null;
  }
};


export const fetchArticlesByTag = async (tagName: string): Promise<Article[]> => {
  try {
    const response = await apiClient.get(`/api/articles/tag/${encodeURIComponent(tagName)}`) as { data: ApiResponse<Article[]> };
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch articles by tag');
  } catch (error) {
    console.error('Error fetching articles by tag:', error);
    throw error;
  }
};


export const fetchAllTags = async (): Promise<Tag[]> => {
  try {
    const response = await apiClient.get('/api/tags') as { data: ApiResponse<Tag[]> };
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch tags');
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }
};


export const generateArticleUrl = (articleId: number): string => {
  return `${blog_url}/article/${articleId}/view`;
};
