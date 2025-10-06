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
- Expo Go บนมือถือ หรือ Emulator ตามแพลตฟอร์มที่ต้องการ

### ฝั่งแอป (Expo)
1. ติดตั้งแพ็กเกจ: `npm install`
2. คัดลอกไฟล์ตัวอย่าง: `cp .env.example .env` แล้วอัปเดต URL ของ backend ตามสภาพแวดล้อม
3. รันแอป: `npm run start` แล้วเลือก platform (`android` / `ios` / `web`)

### ฝั่ง backend (API)
1. `cd backend`
2. ติดตั้งแพ็กเกจ: `npm install`
3. คัดลอกไฟล์ตัวอย่าง: `cp .env.example .env` แล้วกรอกค่าตามระบบของคุณ เช่น
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_user
   DB_PASSWORD=your_password
   DB_NAME=goomeal
   JWT_SECRET=your_jwt_secret
   BASE_URL=http://localhost:3001
   AI_API=http://localhost:11434
   AI_API_KEY=your_ai_key
   RESEND_API_KEY=your_resend_api_key
   EMAIL_SENDER=you@example.com
   APP_PASSWORD=mail_app_password
   ```
4. รันเซิร์ฟเวอร์พัฒนา: `npm run dev`

## คำสั่งที่ใช้บ่อย
- `npm run android` / `npm run ios` / `npm run web` สำหรับทดสอบบนแต่ละแพลตฟอร์ม
- `npm run lint` เพื่อตรวจสอบคุณภาพโค้ด
- Backend: `npm run dev` (ที่โฟลเดอร์ `backend/`)

## โครงสร้างโปรเจ็กต์โดยย่อ
- `screens/`, `components/`, `stores/`, `utils/` — หน้าจอและ logic ของแอปมือถือ
- `backend/` — โค้ด API และสคริปต์ฐานข้อมูล
- `docs/` — บันทึกการออกแบบและสรุปงานเพิ่มเติม

พร้อมเริ่มปรับแต่งและพัฒนาต่อได้ทันที หากต้องการข้อมูลเชิงลึกดูได้จากไฟล์ในโฟลเดอร์ `docs/`
