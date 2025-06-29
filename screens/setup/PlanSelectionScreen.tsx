import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../../hooks/Navigation';
import Header from '../material/Header';
import Menu from '../material/Menu';

const PlanSelectionScreen = () => {
  const navigation = useTypedNavigation<'PlanSelection'>();

  const [plans, setPlans] = useState([
    {
      id: 1,
      name: 'แผนลดน้ำหนัก',
      description: 'แผนการกินเพื่อลดน้ำหนักอย่างปลอดภัย',
      image: '🥗',
    },
    {
      id: 2,
      name: 'แผนเพิ่มกล้ามเนื้อ',
      description: 'แผนการกินเพื่อเพิ่มกล้ามเนื้อและพลังงาน',
      image: '🥩',
    },
  ]);

  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handlePlanOptions = (plan: any) => {
    setSelectedPlan(plan);
    setShowActionSheet(true);
  };

  const handleEdit = () => {
    if (selectedPlan) {
      setEditName(selectedPlan.name);
      setEditDescription(selectedPlan.description);
      setShowActionSheet(false);
      setShowEditModal(true);
    }
  };

  const handleDelete = () => {
    setShowActionSheet(false);
    if (selectedPlan) {
      Alert.alert(
        'ยืนยันการลบ',
        `คุณต้องการลบ "${selectedPlan.name}" หรือไม่?`,
        [
          { text: 'ยกเลิก', style: 'cancel' },
          {
            text: 'ลบ',
            style: 'destructive',
            onPress: () => {
              setPlans(plans.filter(p => p.id !== selectedPlan.id));
              setSelectedPlan(null);
            }
          }
        ]
      );
    }
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาระบุชื่อแผน');
      return;
    }

    if (selectedPlan) {
      setPlans(plans.map(p => 
        p.id === selectedPlan.id 
          ? { ...p, name: editName, description: editDescription }
          : p
      ));
      
      setShowEditModal(false);
      setSelectedPlan(null);
      setEditName('');
      setEditDescription('');
    }
  };

  const handleAddPlan = () => {
    const newPlan = {
      id: Date.now(),
      name: 'แผนใหม่',
      description: 'คำอธิบายแผนใหม่',
      image: '🍽️',
    };
    setPlans([...plans, newPlan]);
  };

  return (
    <View style={styles.container}>
      <Header />
      
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.headerSection}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Icon name="arrow-back" size={24} color="#6b7280" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>แผนการกินที่ยืนยันแล้ว</Text>
            <Text style={styles.subtitle}>จัดการแผนการกินของคุณ</Text>
          </View>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.plansContainer}>
            {plans.map((plan) => (
              <View key={plan.id} style={styles.planCard}>
                <View style={styles.planContent}>
                  <View style={styles.planIcon}>
                    <Text style={styles.planEmoji}>{plan.image}</Text>
                  </View>
                  <View style={styles.planInfo}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planDescription}>{plan.description}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.optionsButton}
                  onPress={() => handlePlanOptions(plan)}
                >
                  <Icon name="ellipsis-vertical" size={20} color="#eab308" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleAddPlan}>
            <Icon name="add" size={24} color="#eab308" />
            <Text style={styles.addButtonText}>+ เพิ่มแผนใหม่</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Action Sheet Modal */}
      <Modal
        visible={showActionSheet}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowActionSheet(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.actionSheet}>
            <TouchableOpacity style={styles.actionButton} onPress={() => setShowActionSheet(false)}>
              <Text style={styles.actionButtonText}>เลือก</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
              <Text style={styles.actionButtonText}>แก้ไข</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>ลบ</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]} 
              onPress={() => setShowActionSheet(false)}
            >
              <Text style={styles.actionButtonText}>ยกเลิก</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editModal}>
            <Text style={styles.modalTitle}>แก้ไขแผนการกิน</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ชื่อแผน</Text>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="ระบุชื่อแผน"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>คำอธิบาย</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="ระบุคำอธิบาย"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>รูปภาพ</Text>
              <TouchableOpacity style={styles.imageUpload}>
                <Icon name="camera" size={32} color="#9ca3af" />
                <Text style={styles.imageUploadText}>เพิ่มรูปภาพ</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelModalButton]} 
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelModalButtonText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleSaveEdit}
              >
                <Text style={styles.saveButtonText}>บันทึก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Menu />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 16,
    marginTop: 4,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  plansContainer: {
    gap: 16,
  },
  planCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  planContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  planIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  planEmoji: {
    fontSize: 32,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  optionsButton: {
    padding: 8,
  },
  addButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  actionSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  actionButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#1f2937',
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
  },
  deleteButtonText: {
    color: '#ef4444',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 0,
    marginTop: 8,
  },
  editModal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  imageUpload: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageUploadText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelModalButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelModalButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  saveButton: {
    backgroundColor: '#eab308',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default PlanSelectionScreen;
