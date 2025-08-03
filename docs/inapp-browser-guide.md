# InAppBrowser Component Usage Guide

## การใช้งาน InAppBrowser Component

InAppBrowser เป็น component สำหรับเปิดเว็บไซต์ภายในแอปโดยไม่ต้องออกไปยังแอปเบราว์เซอร์ภายนอก

### การ Import

```tsx
import InAppBrowser from '../components/InAppBrowser';
```

### การใช้งานพื้นฐาน

```tsx
const [browserVisible, setBrowserVisible] = useState(false);
const [browserUrl, setBrowserUrl] = useState('');
const [browserTitle, setBrowserTitle] = useState('');

// Function to open browser
const openInAppBrowser = (url: string, title?: string) => {
  setBrowserUrl(url);
  setBrowserTitle(title || 'เว็บไซต์');
  setBrowserVisible(true);
};

// JSX
<InAppBrowser
  isVisible={browserVisible}
  url={browserUrl}
  title={browserTitle}
  onClose={() => setBrowserVisible(false)}
/>
```

### ตัวอย่างการใช้งานกับ Article

```tsx
const handleArticleClick = (article: Article) => {
  const url = generateArticleUrl(article.id);
  if (url) {
    setBrowserUrl(url);
    setBrowserTitle(article.title);
    setBrowserVisible(true);
  }
};
```

## Features

- ✅ เปิดเว็บไซต์ภายในแอป
- ✅ ปุ่ม Back/Forward สำหรับการนำทาง
- ✅ ปุ่ม Refresh
- ✅ แสดง Loading state
- ✅ แสดง URL ปัจจุบัน
- ✅ ปุ่มปิดและแชร์
- ✅ Handle errors
- ✅ Responsive design
- ✅ รองรับทั้ง iOS และ Android

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| isVisible | boolean | ✅ | แสดง/ซ่อน browser modal |
| url | string | ✅ | URL ที่ต้องการเปิด |
| title | string | ❌ | ชื่อหัวข้อที่แสดงใน header |
| onClose | () => void | ✅ | Callback เมื่อปิด browser |

## การติดตั้ง Dependencies

```bash
npm install react-native-webview
```

สำหรับ React Native >= 0.60 จะ auto-link อัตโนมัติ

## หมายเหตุ

- รองรับ JavaScript และ DOM storage
- มี User Agent ที่เหมาะสมสำหรับแต่ละแพลตฟอร์ม
- รองรับ Mixed Content และ Third-party cookies
- มี Error handling สำหรับกรณีโหลดไม่สำเร็จ
