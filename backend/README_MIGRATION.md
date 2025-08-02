# Database Migration Instructions

## Steps to Update Database Schema

1. **Backup your database first** (recommended)
   ```bash
   mysqldump -u your_username -p goodmeal > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Run the migration SQL**
   - Open your MySQL client (phpMyAdmin, MySQL Workbench, or command line)
   - Connect to your `goodmeal` database
   - Execute the SQL from `backend/sql/migration_user_food_columns.sql`

3. **Verify the changes**
   ```sql
   DESCRIBE user_food;
   ```
   
   You should see these columns:
   - `src` varchar(50) DEFAULT 'user'
   - `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
   - `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

4. **Test the API**
   - Restart your backend server
   - Test the `/food/user` endpoint
   - Try filtering by source: `/food/user?src=user` or `/food/user?src=ai`

## What's New

### Backend Features:
- ✅ `src` column to track food source ('user' or 'ai')
- ✅ `created_at` and `updated_at` timestamps
- ✅ Source filtering in API (`?src=user` or `?src=ai`)
- ✅ Performance indexes

### Frontend Features:
- ✅ Filter buttons (ทั้งหมด, เพิ่มเอง, จาก AI)
- ✅ Source badges on food cards
- ✅ Enhanced food management with source tracking

## Error Handling

If you get "Unknown column" errors:
1. Make sure you ran the migration SQL
2. Check that all columns exist in the database
3. Restart your backend server

## Future Usage

When adding foods via AI, set `src: 'ai'` in the request:
```javascript
await apiClient.addUserFood({
  name: 'AI Generated Food',
  calories: 300,
  // ... other fields
  src: 'ai'
});
```
