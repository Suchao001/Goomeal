# ProfileDetailScreen และ EditProfileScreen - การอัปเดต API Integration และ Token Refresh

## สรุปการอัปเดต

### 1. สร้าง ApiClient Utility (`utils/apiClient.ts`)
- **Token Management**: จัดการ access token และ refresh token อัตโนมัติ
- **Auto Refresh**: ตรวจสอบและ refresh token ที่กำลังจะหมดอายุ
- **Request Interceptor**: เพิ่ม Authorization header ให้ทุก request
- **Response Interceptor**: จัดการ 401 errors และ retry requests
- **Error Handling**: ฟังก์ชัน `handleApiError` สำหรับแสดง error messages ที่เหมาะสม

### 2. อัปเดต EditProfileScreen
- **ใช้ ApiClient**: แทนที่ axios calls โดยตรง
- **Token Refresh Logic**: จัดการ token refresh แบบโปร่งใส
- **Error Handling**: ใช้ `handleApiError` สำหรับ consistent error messages
- **Loading States**: เพิ่ม loading indicators

### 3. อัปเดต ProfileDetailScreen
- **API Integration**: ดึงข้อมูลจาก backend API
- **Real-time BMI**: คำนวณ BMI จากข้อมูลจริง
- **Dynamic Content**: แสดงข้อมูลส่วนตัวที่อัปเดตได้
- **Thai Labels**: เปลี่ยน BMI categories เป็นภาษาไทย
- **Smart BMI Status**: แสดงคำแนะนำที่เหมาะสมตาม BMI
- **Loading State**: แสดง loading indicator ขณะดึงข้อมูล
- **Refresh Button**: ปุ่ม refresh ข้อมูลใน header
- **Auto Refresh**: รีเฟรชข้อมูลเมื่อกลับจาก EditProfileScreen

### 4. อัปเดต AuthContext
- **ใช้ ApiClient**: ลดความซับซ้อนใน token management
- **Simplified Logic**: ApiClient จัดการ token refresh แล้ว

### 5. อัปเดต Backend (user_route.ts)
- **Consistent Response**: เพิ่ม `success: true` ใน refresh token response
- **Better Error Messages**: ปรับปรุง error responses

## ประโยชน์ที่ได้รับ

### 1. User Experience
- **Seamless Authentication**: ผู้ใช้ไม่เห็น 401 errors จาก expired tokens
- **Real-time Data**: ข้อมูลโปรไฟล์อัปเดตแบบเรียลไทม์
- **Smart BMI Feedback**: คำแนะนำที่เหมาะสมตาม BMI ของผู้ใช้
- **Thai Interface**: BMI categories และคำแนะนำเป็นภาษาไทย

### 2. Developer Experience
- **Centralized API Logic**: จัดการ API calls ที่เดียว
- **Consistent Error Handling**: error messages แบบเดียวกันทั้งแอป
- **Type Safety**: TypeScript support เต็มรูปแบบ
- **Easy Maintenance**: แก้ไข API logic ที่เดียวใช้ได้ทั้งแอป

### 3. Code Quality
- **DRY Principle**: ไม่มี duplicate token management code
- **Single Responsibility**: แต่ละคอมโพเนนต์มีหน้าที่ชัดเจน
- **Error Resilience**: จัดการ network errors และ authentication failures
- **Performance**: cache tokens และ minimize API calls

## การใช้งาน ApiClient

```typescript
// ในคอมโพเนนต์ใดก็ได้
import { apiClient, handleApiError } from '../utils/apiClient';

try {
  const response = await apiClient.get('/user/profile');
  // ใช้ข้อมูล
} catch (error) {
  const errorInfo = handleApiError(error);
  Alert.alert(errorInfo.title, errorInfo.message);
  
  if (errorInfo.shouldLogout) {
    apiClient.logout();
    navigation.navigate('Login');
  }
}
```

## Files ที่อัปเดต
1. `utils/apiClient.ts` - ใหม่
2. `screens/profile/EditProfileScreen.tsx` - refactored
3. `screens/profile/ProfileDetailScreen.tsx` - refactored  
4. `AuthContext.tsx` - simplified
5. `backend/routes/user_route.ts` - improved response format
6. `docs/api-client-guide.md` - documentation

## การทดสอบ
- ✅ Login/Logout workflow
- ✅ Profile fetch และ update
- ✅ Token refresh เมื่อ token หมดอายุ
- ✅ Error handling สำหรับ network issues
- ✅ BMI calculation และ display
- ✅ Loading states และ UI feedback
