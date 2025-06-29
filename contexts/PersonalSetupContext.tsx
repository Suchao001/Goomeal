import React, { createContext, useContext, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { base_url } from '../config';

// Define the data structure for personal setup
export interface PersonalSetupData {
  // PersonalSetupScreen data
  height?: string;
  weight?: string;
  age?: string;
  gender?: 'male' | 'female' | 'other';
  body_fat?: 'low' | 'normal' | 'high' | 'don\'t know';
  
  // PersonalPlanScreen1 data
  target_goal?: 'decrease' | 'increase' | 'healthy';
  target_weight?: string;
  plan_duration?: string;
  
  // PersonalPlanScreen2 data
  activity_level?: 'low' | 'moderate' | 'high' | 'very high';
  
  // PersonalPlanScreen3 data
  eating_type?: 'omnivore' | 'keto' | 'vegetarian' | 'vegan' | 'other';
  
  // PersonalPlanScreen4 data
  dietary_restrictions?: string[];
  additional_requirements?: string;
}

interface PersonalSetupContextType {
  setupData: PersonalSetupData;
  updateSetupData: (data: Partial<PersonalSetupData>) => void;
  getSummary: () => {
    personal: { label: string; value: string }[];
    plan: { label: string; value: string }[];
    activity: { label: string; value: string }[];
    eating: { label: string; value: string }[];
    restrictions: { label: string; value: string }[];
  };
  submitToDatabase: () => Promise<{ success: boolean; message: string }>;
  resetSetupData: () => void;
}

const PersonalSetupContext = createContext<PersonalSetupContextType | undefined>(undefined);

export const PersonalSetupProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [setupData, setSetupData] = useState<PersonalSetupData>({});

  const updateSetupData = (data: Partial<PersonalSetupData>) => {
    setSetupData(prev => ({ ...prev, ...data }));
    console.log('📊 อัปเดตข้อมูล:', { ...setupData, ...data });
  };

  const getSummary = () => {
    // แปลงข้อมูลเป็นข้อความที่อ่านง่าย
    const genderMap = {
      'male': 'ชาย',
      'female': 'หญิง',
      'other': 'อื่นๆ'
    };

    const bodyFatMap = {
      'low': 'ต่ำ',
      'normal': 'ปานกลาง',
      'high': 'สูง',
      'don\'t know': 'ไม่ทราบ'
    };

    const targetGoalMap = {
      'decrease': 'ลดน้ำหนัก',
      'increase': 'เพิ่มน้ำหนัก',
      'healthy': 'สุขภาพดี'
    };

    const activityLevelMap = {
      'low': 'ไม่ออกกำลังกาย',
      'moderate': 'ออกกำลังกาย ระดับปานกลาง',
      'high': 'ออกกำลังกายเป็นหลัก',
      'very high': 'ใช้ร่างกายอย่างหนัก'
    };

    const eatingTypeMap = {
      'omnivore': 'อะไรก็ได้',
      'keto': 'คีโต',
      'vegetarian': 'มังสวิรัติ',
      'vegan': 'วีแกน',
      'other': 'อื่นๆ'
    };

    return {
      personal: [
        { label: 'ส่วนสูง', value: setupData.height ? `${setupData.height} ซม.` : '-' },
        { label: 'น้ำหนัก', value: setupData.weight ? `${setupData.weight} กก.` : '-' },
        { label: 'อายุ', value: setupData.age ? `${setupData.age} ปี` : '-' },
        { label: 'เพศ', value: setupData.gender ? genderMap[setupData.gender] : '-' },
        { label: 'ระดับไขมัน', value: setupData.body_fat ? bodyFatMap[setupData.body_fat] : '-' }
      ],
      plan: [
        { label: 'เป้าหมาย', value: setupData.target_goal ? targetGoalMap[setupData.target_goal] : '-' },
        { label: 'น้ำหนักเป้าหมาย', value: setupData.target_weight ? `${setupData.target_weight} กก.` : '-' },
        { label: 'ระยะเวลาแพลน', value: setupData.plan_duration ? `${setupData.plan_duration} วัน` : '-' }
      ],
      activity: [
        { label: 'ระดับกิจกรรม', value: setupData.activity_level ? activityLevelMap[setupData.activity_level] : '-' }
      ],
      eating: [
        { label: 'ประเภทการกิน', value: setupData.eating_type ? eatingTypeMap[setupData.eating_type] : '-' }
      ],
      restrictions: [
        { label: 'อาหารที่แพ้', value: setupData.dietary_restrictions && setupData.dietary_restrictions.length > 0 ? setupData.dietary_restrictions.join(', ') : 'ไม่มี' },
        { label: 'ความต้องการเพิ่มเติม', value: setupData.additional_requirements || 'ไม่มี' }
      ]
    };
  };

  const submitToDatabase = async (): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('📤 เริ่มส่งข้อมูลไปยัง backend...');
      
      // Get token from secure store
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) {
        throw new Error('ไม่พบ access token กรุณาเข้าสู่ระบบใหม่');
      }

      // เตรียมข้อมูลสำหรับส่งไป backend
      const requestData = {
        age: setupData.age ? parseInt(setupData.age) : undefined,
        weight: setupData.weight ? parseFloat(setupData.weight) : undefined,
        height: setupData.height ? parseFloat(setupData.height) : undefined,
        gender: setupData.gender,
        body_fat: setupData.body_fat,
        target_goal: setupData.target_goal,
        target_weight: setupData.target_weight ? parseFloat(setupData.target_weight) : undefined,
        activity_level: setupData.activity_level,
        eating_type: setupData.eating_type,
        dietary_restrictions: setupData.dietary_restrictions ? setupData.dietary_restrictions.join(', ') : undefined,
        additional_requirements: setupData.additional_requirements || undefined
      };

      console.log('📊 ข้อมูลที่จะส่ง:', requestData);

      const response = await fetch(`${base_url}:3000/user/update-personal-data`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
      
      console.log('✅ บันทึกข้อมูลสำเร็จ:', result);
      return { 
        success: true, 
        message: 'บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว' 
      };
      
    } catch (error: any) {
      console.error('❌ เกิดข้อผิดพลาดในการส่งข้อมูล:', error);
      return { 
        success: false, 
        message: error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' 
      };
    }
  };

  const resetSetupData = () => {
    setSetupData({});
  };

  return (
    <PersonalSetupContext.Provider 
      value={{ 
        setupData, 
        updateSetupData, 
        getSummary,
        resetSetupData,
        submitToDatabase 
      }}
    >
      {children}
    </PersonalSetupContext.Provider>
  );
};

export const usePersonalSetup = () => {
  const context = useContext(PersonalSetupContext);
  if (context === undefined) {
    throw new Error('usePersonalSetup must be used within a PersonalSetupProvider');
  }
  return context;
};
