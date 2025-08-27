// ตัวอย่างการใช้งานระบบแนะนำการกินรายวันในแอป Goodmeal
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { generateDailyRecommendation, type DailyRecommendation } from '../utils/dailyRecommendationService';

// Mock function สำหรับดึงข้อมูลจาก API ที่มีอยู่
const mockGetUserData = async (userId: string) => {
  // ในการใช้งานจริงจะเรียก API ที่มีอยู่
  return {
    target_goal: 'decrease' as const,
    weight: 70,
    age: 28,
    activity_level: 'moderate'
  };
};

const mockGetDailyNutritionSummary = async (userId: string, date: string) => {
  // ในการใช้งานจริงจะเรียก daily_nutrition_summary table
  return {
    recommended_cal: 1800,
    recommended_protein: 90,
    recommended_carbs: 225,
    recommended_fat: 60,
    actual_calories: 1847,
    actual_protein: 85,
    actual_carbs: 234,
    actual_fat: 62
  };
};

interface SmartFoodRecommendationProps {
  userId: string;
  date?: string;
}

const SmartFoodRecommendation: React.FC<SmartFoodRecommendationProps> = ({ 
  userId, 
  date = new Date().toISOString().split('T')[0] 
}) => {
  const [recommendation, setRecommendation] = useState<DailyRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecommendation = async () => {
      try {
        setLoading(true);
        
        // ดึงข้อมูลผู้ใช้
        const userData = await mockGetUserData(userId);
        
        // ดึงข้อมูลโภชนาการรายวัน
        const nutritionData = await mockGetDailyNutritionSummary(userId, date);
        
        // สร้างคำแนะนำ
        const result = generateDailyRecommendation(
          {
            calories: nutritionData.actual_calories,
            protein: nutritionData.actual_protein,
            carbs: nutritionData.actual_carbs,
            fat: nutritionData.actual_fat
          },
          {
            calories: nutritionData.recommended_cal,
            protein: nutritionData.recommended_protein,
            carbs: nutritionData.recommended_carbs,
            fat: nutritionData.recommended_fat
          },
          userData
        );
        
        setRecommendation(result);
        setError(null);
      } catch (err) {
        console.error('Error loading recommendation:', err);
        setError('ไม่สามารถโหลดคำแนะนำได้ กรุณาลองใหม่');
      } finally {
        setLoading(false);
      }
    };

    loadRecommendation();
  }, [userId, date]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>กำลังสร้างคำแนะนำ...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!recommendation) {
    return null;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <Text style={styles.dateText}>📅 {recommendation.date}</Text>
        <Text style={styles.summaryText}>{recommendation.summary}</Text>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min(100, recommendation.totalScore)}%`,
                  backgroundColor: getScoreColor(recommendation.totalScore)
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{recommendation.totalScore}/100</Text>
        </View>
      </View>

      {/* Nutrition Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💪 โภชนาการวันนี้</Text>
        {recommendation.nutritionAdvice.map((advice, index) => (
          <View key={index} style={styles.adviceRow}>
            <Text style={styles.adviceText}>{advice}</Text>
          </View>
        ))}
      </View>

      {/* Activity Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏃‍♂️ กิจกรรมแนะนำ</Text>
        {recommendation.activityAdvice.map((advice, index) => (
          <View key={index} style={styles.adviceRow}>
            <Text style={styles.adviceText}>{advice}</Text>
          </View>
        ))}
      </View>

      {/* Hydration Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💧 การดื่มน้ำ</Text>
        {recommendation.hydrationAdvice.map((advice, index) => (
          <View key={index} style={styles.adviceRow}>
            <Text style={styles.adviceText}>{advice}</Text>
          </View>
        ))}
      </View>

      {/* Tomorrow Tips Card */}
      <View style={[styles.card, styles.tipsCard]}>
        <Text style={styles.cardTitle}>🎯 เคล็ดลับสำหรับพรุ่งนี้</Text>
        {recommendation.tomorrowTips.map((tip, index) => (
          <View key={index} style={styles.tipRow}>
            <View style={styles.tipNumber}>
              <Text style={styles.tipNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>

      {/* Score Detail Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 รายละเอียดคะแนน</Text>
        <View style={styles.scoreGrid}>
          {[
            { label: 'แคลอรี่', key: 'calories' as const, icon: '🔥' },
            { label: 'โปรตีน', key: 'protein' as const, icon: '💪' },
            { label: 'คาร์บ', key: 'carbs' as const, icon: '🍚' },
            { label: 'ไขมัน', key: 'fat' as const, icon: '🥑' }
          ].map((item) => {
            const assessment = recommendation.assessments[item.key];
            return (
              <View key={item.key} style={styles.scoreItem}>
                <Text style={styles.scoreIcon}>{item.icon}</Text>
                <Text style={styles.scoreLabel}>{item.label}</Text>
                <Text style={styles.scoreValue}>{assessment.score}/25</Text>
                <Text style={[styles.scorePercent, { color: getPercentageColor(assessment.percentage) }]}>
                  {assessment.percentage.toFixed(0)}%
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

// Helper functions
function getScoreColor(score: number): string {
  if (score >= 90) return '#28a745';
  if (score >= 80) return '#17a2b8';
  if (score >= 70) return '#ffc107';
  if (score >= 60) return '#fd7e14';
  return '#dc3545';
}

function getPercentageColor(percentage: number): string {
  if (percentage >= 90 && percentage <= 110) return '#28a745';
  if (percentage >= 80 && percentage <= 120) return '#17a2b8';
  if (percentage >= 70) return '#ffc107';
  return '#dc3545';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
  },
  headerCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
    minWidth: 50,
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 16,
  },
  adviceRow: {
    marginBottom: 8,
  },
  adviceText: {
    fontSize: 15,
    color: '#495057',
    lineHeight: 22,
  },
  tipsCard: {
    backgroundColor: '#e7f3ff',
    borderLeftWidth: 4,
    borderLeftColor: '#0066cc',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0066cc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  tipNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    color: '#495057',
    lineHeight: 22,
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
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  scoreIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 4,
  },
  scorePercent: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SmartFoodRecommendation;
