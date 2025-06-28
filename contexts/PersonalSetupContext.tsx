import React, { createContext, useContext, useState, ReactNode } from 'react';

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

  const resetSetupData = () => {
    setSetupData({});
  };

  return (
    <PersonalSetupContext.Provider 
      value={{ 
        setupData, 
        updateSetupData, 
        getSummary,
        resetSetupData 
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
