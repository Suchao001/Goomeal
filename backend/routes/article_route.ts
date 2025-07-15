import express, { Request, Response, Router, RequestHandler } from "express";
import {
  getArticles,
  getArticleById,
  getFeaturedArticles,
  getArticlesByTag,
  getAllTags
} from '../controllers/article_controller';

const router: Router = express.Router();

// GET /articles - ดึงบทความทั้งหมด
const getAllArticles: RequestHandler = async (req: Request, res: Response) => {
  try {
    const articles = await getArticles();
    res.status(200).json({
      success: true,
      data: articles
    });
  } catch (error) {
    console.error('Error in GET /articles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch articles'
    });
  }
};

router.get('/articles', getAllArticles);

// GET /articles/featured - ดึงบทความแนะนำ
const getFeaturedArticlesHandler: RequestHandler = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 3;
    const articles = await getFeaturedArticles(limit);
    res.status(200).json({
      success: true,
      data: articles
    });
  } catch (error) {
    console.error('Error in GET /articles/featured:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured articles'
    });
  }
};

router.get('/articles/featured', getFeaturedArticlesHandler);

// GET /articles/:id - ดึงบทความโดย ID
const getArticleByIdHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid article ID'
      });
      return;
    }

    const article = await getArticleById(id);
    if (!article) {
      res.status(404).json({
        success: false,
        message: 'Article not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('Error in GET /articles/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch article'
    });
  }
};

router.get('/articles/:id', getArticleByIdHandler);

// GET /articles/tag/:tagName - ดึงบทความตาม tag
const getArticlesByTagHandler: RequestHandler = async (req: Request, res: Response) => {
  try {
    const tagName = req.params.tagName;
    const articles = await getArticlesByTag(tagName);
    res.status(200).json({
      success: true,
      data: articles
    });
  } catch (error) {
    console.error('Error in GET /articles/tag/:tagName:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch articles by tag'
    });
  }
};

router.get('/articles/tag/:tagName', getArticlesByTagHandler);

// GET /tags - ดึง tags ทั้งหมด
const getAllTagsHandler: RequestHandler = async (req: Request, res: Response) => {
  try {
    const tags = await getAllTags();
    res.status(200).json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('Error in GET /tags:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tags'
    });
  }
};

router.get('/tags', getAllTagsHandler);

export default router;