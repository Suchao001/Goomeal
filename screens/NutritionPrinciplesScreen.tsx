import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../hooks/Navigation';

const sections = [
  {
  title: 'หลักการโภชนาการพื้นฐาน',
    description:
      'การจัดสมดุลพลังงานและสารอาหารเป็นหัวใจหลักของการดูแลสุขภาพ น้ำหนักที่เหมาะสมขึ้นอยู่กับการรับพลังงานเทียบกับการเผาผลาญในแต่ละวัน',
    points: [
      'พลังงานที่รับเข้า (Energy In) ควรใกล้เคียงกับพลังงานที่ใช้ไป (Energy Out)',
      'เลือกอาหารครบ 5 หมู่ เน้นวัตถุดิบสดและผ่านการแปรรูปน้อย',
      'สังเกตสัญญาณจากร่างกาย เช่น ความอิ่ม ความอ่อนล้า หรือคุณภาพการนอน',
    ],
  },
  {
    title: 'BMR คืออะไร?',
    description:
      'Basal Metabolic Rate (BMR) คืออัตราการเผาผลาญพื้นฐานเมื่อร่างกายอยู่ในสภาวะพัก ใช้ประมาณพลังงานขั้นต่ำที่ต้องการต่อวัน',
    points: [
      'สูตรคำนวณ (Mifflin-St Jeor):',
      'ชาย: (10 x น้ำหนักกก.) + (6.25 x ส่วนสูงซม.) - (5 x อายุปี) + 5',
      'หญิง: (10 x น้ำหนักกก.) + (6.25 x ส่วนสูงซม.) - (5 x อายุปี) - 161',
      'ใช้ค่า BMR เป็นจุดเริ่มต้นเพื่อวางแผนพลังงานและไม่ควรรับพลังงานต่ำกว่าค่านี้ต่อเนื่อง',
    ],
  },
  {
    title: 'TDEE คืออะไร?',
    description:
      'Total Daily Energy Expenditure (TDEE) คือพลังงานรวมที่ร่างกายใช้จริงในหนึ่งวัน โดยคูณ BMR กับระดับกิจกรรม',
    points: [
      'นั่งทำงาน/ออกกำลังน้อย: BMR x 1.2',
      'ออกกำลังกายเบา 1-3 วัน/สัปดาห์: BMR x 1.375',
      'ออกกำลังกายปานกลาง 3-5 วัน/สัปดาห์: BMR x 1.55',
      'ออกกำลังกายหนัก 6-7 วัน/สัปดาห์: BMR x 1.725',
      'นักกีฬาหรือใช้แรงมาก: BMR x 1.9',
    ],
  },
  {
    title: 'สัดส่วนสารอาหารหลัก (Macronutrients)',
    description:
      'การกระจายพลังงานจากคาร์โบไฮเดรต โปรตีน และไขมันช่วยสนับสนุนการฟื้นตัว ฮอร์โมน และพลังงานระหว่างวัน',
    points: [
      'คาร์โบไฮเดรต 45-65% ของพลังงานรวม เลือกธัญพืชเต็มเมล็ด ผัก และผลไม้',
      'โปรตีน 15-35% ของพลังงานรวม เลือกโปรตีนไม่ติดมัน ถั่ว และผลิตภัณฑ์นมไขมันต่ำ',
      'ไขมันดี 20-35% ของพลังงานรวม เน้นน้ำมันพืชไม่อิ่มตัว ถั่ว และอะโวคาโด',
      'ดื่มน้ำ 30-40 มล./กก. น้ำหนักตัว และเพิ่มขึ้นเมื่อออกกำลังกาย',
    ],
  },
  {
    title: 'วิธีนำไปใช้ในชีวิตประจำวัน',
    description:
      'ใช้ข้อมูลจาก BMR และ TDEE ร่วมกับเป้าหมายส่วนตัวเพื่อวางแผนอาหารและกิจกรรม',
    points: [
      'กำหนดเป้าหมายน้ำหนักหรือองค์ประกอบร่างกาย แล้วปรับพลังงาน +/- 200-500 kcal ตามความเหมาะสม',
      'เลือกเมนูที่มีสารอาหารครบถ้วน และเตรียมอาหารล่วงหน้าเพื่อลดการตัดสินใจเฉพาะหน้า',
      'สังเกตผลลัพธ์ทุก 2-4 สัปดาห์ แล้วปรับปริมาณพลังงานหรือสัดส่วนสารอาหารตามความเปลี่ยนแปลง',
    ],
  },
];

const references = [
  {
    title: 'Macro Calculator (Athlean-X)',
    url: 'https://learn.athleanx.com/calculators/macro-calculator',
  },
  {
    title: 'Calorie Calculator (NASM)',
    url: 'https://www.nasm.org/resources/calorie-calculator',
  },
  {
    title: 'Daily Calorie & Macronutrient Intake (Muscle & Strength)',
    url: 'https://www.muscleandstrength.com/articles/determine-daily-calorie-macronutrient-intake',
  },
];

const NutritionPrinciplesScreen = () => {
  const navigation = useTypedNavigation<'NutritionPrinciples'>();

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(() => {
      // ป้องกันแอป crash หากเปิดลิงก์ไม่ได้
    });
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 60, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center gap-4 mb-6">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-11 h-11 rounded-full bg-white border border-gray-200 items-center justify-center shadow-sm"
            accessibilityRole="button"
            accessibilityLabel="ย้อนกลับ"
          >
            <Icon name="chevron-back" size={22} color="#6b7280" />
          </TouchableOpacity>
          <Text className="text-2xl font-promptSemiBold text-gray-800">หลักการโภชนาการ</Text>
        </View>

        <Text className="text-base text-gray-600 font-prompt">
          รวมสรุปแนวคิดสำคัญอย่าง BMR, TDEE และสัดส่วนสารอาหาร เพื่อช่วยให้คุณวางแผนการกินได้อย่างมีเป้าหมาย
        </Text>

        <View className="mt-6">
          {sections.map(section => (
            <View
              key={section.title}
              className="bg-white rounded-2xl p-5 mb-5 shadow-md shadow-slate-200"
            >
              <Text className="text-xl font-promptSemiBold text-gray-800">
                {section.title}
              </Text>
              <Text className="text-sm text-gray-600 font-prompt mt-3">
                {section.description}
              </Text>
              {section.points.map(point => (
                <Text
                  key={point}
                  className="text-sm text-gray-700 font-prompt mt-3"
                >
                  • {point}
                </Text>
              ))}
            </View>
          ))}
        </View>

        <View className="mt-4 bg-white rounded-2xl p-5 shadow-md shadow-slate-200">
          <Text className="text-xl font-promptSemiBold text-gray-800">แหล่งอ้างอิง</Text>
          <Text className="text-sm text-gray-600 font-prompt mt-2">
            ข้อมูลคำนวณและแนวทางเหล่านี้อ้างอิงจากเครื่องมือและบทความโภชนาการที่น่าเชื่อถือ
          </Text>
          {references.map(ref => (
            <TouchableOpacity
              key={ref.url}
              onPress={() => openUrl(ref.url)}
              className="mt-4 flex-row items-center justify-between"
              accessibilityRole="link"
              accessibilityLabel={`เปิด ${ref.title}`}
            >
              <View className="flex-1 mr-3">
                <Text className="text-sm font-promptSemiBold text-blue-600">{ref.title}</Text>
                <Text className="text-xs text-gray-500 font-prompt mt-1">{ref.url}</Text>
              </View>
              <Icon name="open-outline" size={18} color="#6366f1" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default NutritionPrinciplesScreen;
