import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { 
  generateDailyRecommendation, 
  type DailyRecommendation,
  type DailyNutritionData,
  type RecommendedNutrition,
  type UserProfile
} from '../utils/dailyRecommendationService';
import { testScenarios, runAllTests } from '../utils/dailyRecommendationTest';

interface DailyRecommendationDisplayProps {
  actualIntake: DailyNutritionData;
  recommended: RecommendedNutrition;
  userProfile: UserProfile;
}

const DailyRecommendationDisplay: React.FC<DailyRecommendationDisplayProps> = ({
  actualIntake,
  recommended,
  userProfile
}) => {
  const [recommendation, setRecommendation] = useState<DailyRecommendation | null>(null);

  useEffect(() => {
    const result = generateDailyRecommendation(actualIntake, recommended, userProfile);
    setRecommendation(result);
  }, [actualIntake, recommended, userProfile]);

  if (!recommendation) {
    return (
      <View style={styles.loading}>
        <Text>กำลังสร้างคำแนะนำ...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.date}>📅 {recommendation.date}</Text>
        <Text style={styles.summary}>{recommendation.summary}</Text>
      </View>

      {/* Nutrition Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💪 โภชนาการ</Text>
        {recommendation.nutritionAdvice.map((advice, index) => (
          <Text key={index} style={styles.adviceText}>{advice}</Text>
        ))}
      </View>

      {/* Activity Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏃‍♂️ กิจกรรม</Text>
        {recommendation.activityAdvice.map((advice, index) => (
          <Text key={index} style={styles.adviceText}>{advice}</Text>
        ))}
      </View>

      {/* Hydration Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💧 น้ำ</Text>
        {recommendation.hydrationAdvice.map((advice, index) => (
          <Text key={index} style={styles.adviceText}>{advice}</Text>
        ))}
      </View>

      {/* Timing Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⏰ เวลาการกิน</Text>
        {recommendation.timingAdvice.map((advice, index) => (
          <Text key={index} style={styles.adviceText}>{advice}</Text>
        ))}
      </View>

      {/* Tomorrow Tips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 เคล็ดลับสำหรับพรุ่งนี้</Text>
        {recommendation.tomorrowTips.map((tip, index) => (
          <Text key={index} style={styles.tipText}>{tip}</Text>
        ))}
      </View>

      {/* Score Details */}
      <View style={styles.scoreSection}>
        <Text style={styles.sectionTitle}>📊 รายละเอียดคะแนน</Text>
        <View style={styles.scoreGrid}>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>แคลอรี่</Text>
            <Text style={styles.scoreValue}>{recommendation.assessments.calories.score}/25</Text>
            <Text style={styles.scorePercent}>{recommendation.assessments.calories.percentage.toFixed(0)}%</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>โปรตีน</Text>
            <Text style={styles.scoreValue}>{recommendation.assessments.protein.score}/25</Text>
            <Text style={styles.scorePercent}>{recommendation.assessments.protein.percentage.toFixed(0)}%</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>คาร์บ</Text>
            <Text style={styles.scoreValue}>{recommendation.assessments.carbs.score}/25</Text>
            <Text style={styles.scorePercent}>{recommendation.assessments.carbs.percentage.toFixed(0)}%</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>ไขมัน</Text>
            <Text style={styles.scoreValue}>{recommendation.assessments.fat.score}/25</Text>
            <Text style={styles.scorePercent}>{recommendation.assessments.fat.percentage.toFixed(0)}%</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

// Test Component สำหรับทดสอบ scenarios ต่างๆ
export const DailyRecommendationTestScreen: React.FC = () => {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const currentScenario = testScenarios[currentScenarioIndex];

  const nextScenario = () => {
    setCurrentScenarioIndex((prev) => (prev + 1) % testScenarios.length);
  };

  const prevScenario = () => {
    setCurrentScenarioIndex((prev) => (prev - 1 + testScenarios.length) % testScenarios.length);
  };

  const runConsoleTests = () => {
    runAllTests();
  };

  return (
    <View style={styles.testContainer}>
      {/* Test Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={prevScenario}>
          <Text style={styles.buttonText}>← ก่อนหน้า</Text>
        </TouchableOpacity>
        
        <View style={styles.scenarioInfo}>
          <Text style={styles.scenarioTitle}>{currentScenario.name}</Text>
          <Text style={styles.scenarioCount}>{currentScenarioIndex + 1} / {testScenarios.length}</Text>
        </View>
        
        <TouchableOpacity style={styles.button} onPress={nextScenario}>
          <Text style={styles.buttonText}>ถัดไป →</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.testButton} onPress={runConsoleTests}>
        <Text style={styles.testButtonText}>🧪 รัน Console Tests</Text>
      </TouchableOpacity>

      {/* Recommendation Display */}
      <DailyRecommendationDisplay
        actualIntake={currentScenario.actualIntake}
        recommended={currentScenario.recommended}
        userProfile={currentScenario.userProfile}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  summary: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  adviceText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    lineHeight: 20,
  },
  tipText: {
    fontSize: 14,
    color: '#0066cc',
    marginBottom: 6,
    lineHeight: 20,
  },
  scoreSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  scoreItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  scorePercent: {
    fontSize: 12,
    color: '#0066cc',
  },
  testContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  button: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scenarioInfo: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  scenarioTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  scenarioCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  testButton: {
    backgroundColor: '#28a745',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DailyRecommendationDisplay;
