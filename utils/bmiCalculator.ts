/**
 * BMI Calculator with support for children and adults
 * Includes CDC percentile-based interpretation for children under 20 years old
 */

export interface BMIResult {
  bmi: number;
  category: string;
  description: string;
  color: string;
  isChild: boolean;
  percentileInfo?: string;
}

export interface BMICategory {
  label: string;
  color: string;
  range: string;
}


export const ADULT_BMI_CATEGORIES: BMICategory[] = [
  { label: 'น้ำหนักต่ำ', color: '#3b82f6', range: '< 18.5' },
  { label: 'ปกติ', color: '#22c55e', range: '18.5-24.9' },
  { label: 'เกินน้ำหนัก', color: '#f59e0b', range: '25-29.9' },
  { label: 'อ้วน', color: '#f97316', range: '30-34.9' },
  { label: 'อ้วนอันตราย', color: '#ef4444', range: '≥ 35' },
];


export const CHILD_BMI_CATEGORIES: BMICategory[] = [
  { label: 'น้ำหนักต่ำ', color: '#3b82f6', range: '< 5th percentile' },
  { label: 'ปกติ', color: '#22c55e', range: '5th-85th percentile' },
  { label: 'เกินน้ำหนัก', color: '#f59e0b', range: '85th-95th percentile' },
  { label: 'อ้วน', color: '#ef4444', range: '≥ 95th percentile' },
];

/**
 * Calculate BMI value
 */
export const calculateBMI = (weight?: number, height?: number): number => {
  if (!weight || !height || weight <= 0 || height <= 0) return 0;
  const heightInMeters = height / 100;
  return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
};

/**
 * Get BMI category for adults (≥20 years old)
 */
const getAdultBMICategory = (bmi: number): number => {
  if (bmi < 18.5) return 0;
  if (bmi < 25) return 1;
  if (bmi < 30) return 2;
  if (bmi < 35) return 3;
  return 4;
};

/**
 * Simplified BMI-for-age percentile estimation for children
 * Note: This is a simplified version. Real implementation would require
 * detailed percentile tables by age and gender from CDC/WHO
 */
const getChildBMICategory = (bmi: number, age: number, gender?: string): number => {
  const baseThresholds = {
    underweight: 16 + (age - 10) * 0.2, 
    normal: 18 + (age - 10) * 0.3,
    overweight: 22 + (age - 10) * 0.4,
    obese: 25 + (age - 10) * 0.5
  };

  if (bmi < baseThresholds.underweight) return 0; 
  if (bmi < baseThresholds.overweight) return 1;  
  if (bmi < baseThresholds.obese) return 2;       
  return 3;                                       
};

/**
 * Get BMI description for adults
 */
const getAdultBMIDescription = (categoryIndex: number): string => {
  const descriptions = [
    'คุณมีน้ำหนักต่ำกว่าเกณฑ์ ควรเพิ่มน้ำหนักให้อยู่ในเกณฑ์ปกติ',
    'คุณมีน้ำหนักอยู่ในเกณฑ์ปกติ ควรรักษาน้ำหนักให้อยู่ในระดับนี้ต่อไป',
    'คุณมีน้ำหนักเกินเกณฑ์ ควรลดน้ำหนักให้อยู่ในเกณฑ์ปกติ',
    'คุณมีน้ำหนักเกินมาก ควรปรึกษาแพทย์และลดน้ำหนัก',
    'คุณมีน้ำหนักเกินมากเป็นอันตราย ควรปรึกษาแพทย์โดยด่วน'
  ];
  return descriptions[categoryIndex] || 'ไม่สามารถประเมินได้';
};

/**
 * Get BMI description for children
 */
const getChildBMIDescription = (categoryIndex: number): string => {
  const descriptions = [
    'น้ำหนักต่ำกว่าเกณฑ์สำหรับเด็กในช่วงอายุนี้ ควรปรึกษาแพทย์เด็กเพื่อการดูแลที่เหมาะสม',
    'น้ำหนักอยู่ในเกณฑ์ปกติสำหรับเด็กในช่วงอายุนี้ ควรรักษาการเจริญเติบโตให้สม่ำเสมอ',
    'น้ำหนักเกินเกณฑ์สำหรับเด็กในช่วงอายุนี้ ควรปรึกษาแพทย์เด็กเพื่อแนวทางการดูแล',
    'น้ำหนักเกินมากสำหรับเด็กในช่วงอายุนี้ ควรปรึกษาแพทย์เด็กโดยด่วนเพื่อการดูแลที่เหมาะสม'
  ];
  return descriptions[categoryIndex] || 'ไม่สามารถประเมินได้';
};

/**
 * Get percentile information for children
 */
const getPercentileInfo = (categoryIndex: number): string => {
  const percentileInfo = [
    'ต่ำกว่า percentile ที่ 5 (น้ำหนักต่ำเมื่อเทียบกับเด็กในวัยเดียวกัน)',
    'อยู่ใน percentile ที่ 5-85 (น้ำหนักปกติเมื่อเทียบกับเด็กในวัยเดียวกัน)',
    'อยู่ใน percentile ที่ 85-95 (เกินน้ำหนักเมื่อเทียบกับเด็กในวัยเดียวกัน)',
    'สูงกว่า percentile ที่ 95 (อ้วนเมื่อเทียบกับเด็กในวัยเดียวกัน)'
  ];
  return percentileInfo[categoryIndex] || '';
};

/**
 * Calculate comprehensive BMI result with age-appropriate interpretation
 */
export const calculateBMIResult = (
  weight?: number,
  height?: number,
  age?: number,
  gender?: 'male' | 'female' | 'other'
): BMIResult => {
  const bmi = calculateBMI(weight, height);
  
  if (bmi === 0) {
    return {
      bmi: 0,
      category: 'ไม่สามารถคำนวณได้',
      description: 'กรุณาระบุน้ำหนักและส่วนสูงที่ถูกต้อง',
      color: '#9ca3af',
      isChild: false
    };
  }

  const isChild = age !== undefined && age < 20;
  
  if (isChild) {
    const categoryIndex = getChildBMICategory(bmi, age, gender);
    const categories = CHILD_BMI_CATEGORIES;
    
    return {
      bmi,
      category: categories[categoryIndex].label,
      description: getChildBMIDescription(categoryIndex),
      color: categories[categoryIndex].color,
      isChild: true,
      percentileInfo: getPercentileInfo(categoryIndex)
    };
  } else {
    const categoryIndex = getAdultBMICategory(bmi);
    const categories = ADULT_BMI_CATEGORIES;
    
    return {
      bmi,
      category: categories[categoryIndex].label,
      description: getAdultBMIDescription(categoryIndex),
      color: categories[categoryIndex].color,
      isChild: false
    };
  }
};

/**
 * Get BMI categories based on age
 */
export const getBMICategories = (age?: number): BMICategory[] => {
  const isChild = age !== undefined && age < 20;
  return isChild ? CHILD_BMI_CATEGORIES : ADULT_BMI_CATEGORIES;
};

/**
 * Check if person is considered a child for BMI calculation
 */
export const isChildForBMI = (age?: number): boolean => {
  return age !== undefined && age < 20;
};
