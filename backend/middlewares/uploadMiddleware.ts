import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Default upload directory for user_foods
const userFoodsUploadDir = path.join(__dirname, '..', 'images', 'user_foods');
if (!fs.existsSync(userFoodsUploadDir)) {
  fs.mkdirSync(userFoodsUploadDir, { recursive: true });
}

// Create upload directory for user_food_plans
const userFoodPlansUploadDir = path.join(__dirname, '..', 'images', 'user_food_plans');
if (!fs.existsSync(userFoodPlansUploadDir)) {
  fs.mkdirSync(userFoodPlansUploadDir, { recursive: true });
}

// Function to create storage with specific directory
const createStorage = (subFolder: string) => {
  const uploadDir = path.join(__dirname, '..', 'images', subFolder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Generate unique filename: timestamp_original_name
      const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      const filename = `${uniqueSuffix}${extension}`;
      cb(null, filename);
    }
  });
};

// Configure storage (default for user_foods)
const storage = createStorage('user_foods');

// File filter for images only
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'), false);
  }
};

// Configure multer (default)
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Create specific upload middleware for user_food_plans
export const uploadUserFoodPlan = multer({
  storage: createStorage('user_food_plans'),
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

export default upload;
