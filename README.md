# Goomeal

Goomeal คือแอปผู้ช่วยด้านโภชนาการที่ช่วยวางแผนอาหารและติดตามเมนูประจำวัน ประกอบด้วยแอปมือถือที่สร้างด้วย Expo และบริการ API ที่ทำงานด้วย Express + MySQL

## ฟีเจอร์ที่เด่น
- ตั้งค่าโปรไฟล์และเป้าหมายส่วนตัวเพื่อแนะนำแผนอาหารที่เหมาะสม
- บันทึกมื้ออาหาร ดูสรุปแคลอรีและสารอาหารรายวันแบบเรียลไทม์
- รับบทความและไอเดียเมนูจากระบบแนะนำเนื้อหา
- สนทนากับผู้ช่วย AI สำหรับคำถามด้านโภชนาการและแผนอาหาร
- ส่งอีเมลยืนยันตัวตนและรายงานสรุปรายสัปดาห์ให้ผู้ใช้

## เทคโนโลยีหลัก
- Frontend: Expo (React Native + TypeScript), Zustand, NativeWind, React Navigation
- Backend: Express (TypeScript), Knex, MySQL, JWT, Multer, Nodemailer, OpenAI/LLM integrations

## เริ่มต้นใช้งานอย่างรวดเร็ว
### เตรียมเครื่องมือ
- Node.js 18 ขึ้นไป พร้อม npm หรือ pnpm
- ฐานข้อมูล MySQL ที่สร้าง schema ตรงกับไฟล์ `goodmeal.sql`
- Expo Go version sdk 52 บนมือถือ หรือ Emulator ตามแพลตฟอร์มที่ต้องการ

### ฝั่งแอป (Expo)
1. ติดตั้งแพ็กเกจ: `npm install`
3. สร้างไฟล์ env แล้วกรอกค่าตามระบบของคุโดยมีข้อมูลดังนี้: 
   ```env
   API_URL=http://10.10.57.151:3001 // ip 
   SECOND_BACKEND_URL=http://10.10.57.151:3000 // ของ ฝั่ง admin
   ```
3. รันแอป: `npx expo start` แล้วเลือก platform ต่อด้วย (`--android` / `--ios` / `--web`)

### ฝั่ง backend (API)
1. `cd backend`
2. ติดตั้งแพ็กเกจ: `npm install`
3. สร้างไฟล์ env แล้วกรอกค่าตามระบบของคุโดยมีข้อมูลดังนี้: 
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_user
   DB_PASSWORD=your_password
   DB_NAME=goomeal
   JWT_SECRET=your_jwt_secret
   BASE_URL=http://localhost:3001
   AI_API_KEY=your_ai_key
   EMAIL_SENDER=you@example.com
   APP_PASSWORD=mail_app_password
   ```
4. รันเซิร์ฟเวอร์พัฒนา: `npm run dev`

## คำสั่งที่ใช้บ่อย
- `npx expo start` / `npx expo start --android` / `npx expo start --web` สำหรับทดสอบบนแต่ละแพลตฟอร์ม
- Backend: `npm run dev` (ที่โฟลเดอร์ `backend/`)

## โครงสร้างโปรเจ็กต์โดยย่อ
- `screens/`, `components/`, `stores/`, `utils/` — หน้าจอและ logic ของแอปมือถือ
- `backend/` — โค้ด API และสคริปต์ฐานข้อมูล
- `docs/` — บันทึกการออกแบบและสรุปงานเพิ่มเติม

