# Article API Integration Guide

## Overview
การเชื่อมต่อ API บทความสำหรับ GoodMeal App ใช้สำหรับดึงข้อมูลบทความจาก backend และแสดงใน EatingBlogScreen

## Backend API Endpoints

### 1. GET /api/articles
ดึงบทความทั้งหมดที่เผยแพร่แล้ว
```
GET http://localhost:3001/api/articles
Response: {
  success: true,
  data: Article[]
}
```

### 2. GET /api/articles/featured
ดึงบทความแนะนำ
```
GET http://localhost:3001/api/articles/featured?limit=3
Response: {
  success: true,
  data: Article[]
}
```

### 3. GET /api/articles/:id
ดึงบทความโดย ID
```
GET http://localhost:3001/api/articles/1
Response: {
  success: true,
  data: Article
}
```

### 4. GET /api/articles/tag/:tagName
ดึงบทความตาม tag
```
GET http://localhost:3001/api/articles/tag/สุขภาพ
Response: {
  success: true,
  data: Article[]
}
```

### 5. GET /api/tags
ดึง tags ทั้งหมด
```
GET http://localhost:3001/api/tags
Response: {
  success: true,
  data: Tag[]
}
```

## Frontend Usage

### Environment Variables
ต้องตั้งค่าใน .env:
```
API_URL=http://localhost:3001
BLOG_URL=http://localhost:3000
```

### Article API Client Functions

```typescript
import { 
  fetchArticles, 
  fetchFeaturedArticles, 
  fetchArticleById, 
  fetchArticlesByTag, 
  fetchAllTags,
  generateArticleUrl 
} from '../utils/articleApi';

// ดึงบทความทั้งหมด
const articles = await fetchArticles();

// ดึงบทความแนะนำ
const featured = await fetchFeaturedArticles(3);

// ดึงบทความโดย ID
const article = await fetchArticleById(1);

// ดึงบทความตาม tag
const taggedArticles = await fetchArticlesByTag('สุขภาพ');

// สร้าง URL สำหรับเปิดบทความ
const url = generateArticleUrl(1); // http://localhost:3000/article/1/view
```

## Data Types

### Article Interface
```typescript
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
```

### Tag Interface
```typescript
interface Tag {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}
```

## Database Schema

### eating_blog table
- id (primary key)
- title (varchar)
- img (varchar)
- publish_date (datetime)
- status (enum: 'pending', 'release')
- content (longtext)
- excerpt_content (text)
- created_at (timestamp)
- updated_at (timestamp)

### tags table
- id (primary key)
- name (varchar, unique)

### post_tag table (junction table)
- post_id (foreign key to eating_blog.id)
- tag_id (foreign key to tags.id)

## Features Implemented

### EatingBlogScreen
1. **แสดงบทความแนะนำ**: ใช้ fetchFeaturedArticles()
2. **แสดงบทความทั้งหมด**: ใช้ fetchArticles()
3. **Tab เลือกประเภท**: "แนะนำ" และ "ล่าสุด"
4. **แสดง Tags**: แสดง tags ของแต่ละบทความ
5. **เปิดลิงก์บทความ**: ใช้ generateArticleUrl() และ Linking.openURL()
6. **Loading & Error States**: แสดงสถานะการโหลดและข้อผิดพลาด
7. **รูปภาพ Fallback**: ใช้รูปภาพเริ่มต้นหากไม่มีรูปภาพบทความ

### URL Generation
- ใช้ BLOG_URL จาก environment variable
- รูปแบบ: `{BLOG_URL}/article/{id}/view`
- Example: `http://localhost:3000/article/1/view`

## Error Handling
- Network errors
- API errors
- Invalid responses
- Missing data
- Loading states
- Retry functionality

## Next Steps
1. เพิ่ม pagination สำหรับบทความ
2. เพิ่ม search functionality
3. เพิ่ม filter by tags
4. เพิ่ม bookmarks/favorites
5. เพิ่ม reading time calculation
6. เพิ่ม offline caching
