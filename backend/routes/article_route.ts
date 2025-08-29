import express, { Request, Response, Router, RequestHandler } from "express";
import {
  getArticles,
  getArticleById,
  getFeaturedArticles,
  getGenericFeaturedArticles,
  getArticlesByTag,
  getAllTags
} from '../controllers/article_controller';
import authenticateToken from '../middlewares/authenticateToken';

const router: Router = express.Router();

// Apply authentication to featured articles only (optional auth pattern)
const optionalAuth = (req: Request, res: Response, next: Function) => {
  // Try to authenticate, but don't fail if no token
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    next();
    return;
  }
  
  authenticateToken(req, res, (err?: any) => {
    // Continue regardless of auth success/failure
    next();
  });
};

// GET /articles - ดึงบทความทั้งหมด
router.get('/articles', async (req: Request, res: Response) => {
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
});

// GET /articles/featured - ดึงบทความแนะนำ (with optional auth)
router.get('/articles/featured', optionalAuth, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 3;
    const userId = (req as any).user?.id;
    
    let articles;
    if (userId) {
      articles = await getFeaturedArticles(parseInt(userId), limit);
    } else {
      console.log('No user ID provided, returning generic featured articles');
      articles = await getGenericFeaturedArticles(limit);
    }
    
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
});

// GET /articles/:id - ดึงบทความโดย ID
router.get('/articles/:id', async (req: Request, res: Response) => {
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
});

// GET /articles/tag/:tagName - ดึงบทความตาม tag
router.get('/articles/tag/:tagName', async (req: Request, res: Response) => {
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
});

// GET /tags - ดึง tags ทั้งหมด
router.get('/tags', async (req: Request, res: Response) => {
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
});

export default router;