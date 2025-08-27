import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../../hooks/Navigation';
import Menu from '../material/Menu';
import { apiClient } from '../../utils/apiClient';

/**
 * ChatScreen Component
 * หน้าแชท/สนทนา - สำหรับคุยกับ AI เพื่อแนะนำการกินเพื่อสุขภาพ
 */
const ChatScreen = () => {
  const [message, setMessage] = useState('');
  const navigation = useTypedNavigation<'ChatScreen'>();
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<'style1' | 'style2' | 'style3'>('style1');

  // Load chat history when component mounts
  useEffect(() => {
    loadChatHistory();
    loadChatStyle();
  }, []);

  const loadChatStyle = async () => {
    try {
      const session = await apiClient.getChatSession();
      if (session.style && ['style1', 'style2', 'style3'].includes(session.style)) {
        setSelectedStyle(session.style);
      }
    } catch (error) {
      console.error('Error loading chat style:', error);
    }
  };

  const toggleChatStyle = async (style: 'style1' | 'style2' | 'style3') => {
    try {
      setSelectedStyle(style);
      await apiClient.updateChatStyle(style);
    } catch (error) {
      console.error('Error updating chat style:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเปลี่ยนรูปแบบการสนทนาได้');
    }
  };

  const loadChatHistory = async () => {
    try {
      setIsLoading(true);
      // Get or create session first
      await apiClient.getChatSession();
      
      // Then get chat messages (limit to last 30 messages for performance)
      const messages = await apiClient.getChatMessages(30, 0);
      
      if (Array.isArray(messages)) {
        setChatMessages(messages);
      } else {
        setChatMessages([]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Set default message if no history
      setChatMessages([{
        id: 1,
        text: 'สวัสดีครับ! ผมเป็น AI ที่จะช่วยแนะนำการกินเพื่อสุขภาพและเมนูอาหารให้คุณ มีอะไรให้ช่วยไหมครับ?',
        isBot: true,
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (message.trim() && !isSending) {
      try {
        setIsSending(true);
        
        // สร้าง user message และแสดงทันทีในหน้าจอ
        const userMessage = {
          id: Date.now(), // temporary ID
          text: message.trim(),
          isBot: false,
          role: 'user' as const,
          timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
        };
        
        // แสดง user message ทันทีก่อนส่งไป API
        setChatMessages(prev => {
          const newMessages = [...prev, userMessage];
          // จำกัดข้อความในหน่วยความจำไว้ที่ 50 ข้อความ
          return newMessages.length > 50 ? newMessages.slice(-50) : newMessages;
        });
        setMessage(''); // ล้าง input ทันที
        
        // ส่งข้อความไป API
        const result = await apiClient.sendChatMessage(userMessage.text);
        
        
        // เพิ่มเฉพาะ bot message เมื่อได้รับการตอบกลับ
        if (result && result.botMessage) {
          setChatMessages(prev => {
            const newMessages = [...prev, result.botMessage];
            // จำกัดข้อความในหน่วยความจำไว้ที่ 50 ข้อความ
            return newMessages.length > 50 ? newMessages.slice(-50) : newMessages;
          });
        } else if (result && result.userMessage && result.botMessage) {
          // กรณีที่ API ส่ง user message กลับมาด้วย ให้ใช้ bot message อย่างเดียว
          setChatMessages(prev => {
            const newMessages = [...prev, result.botMessage];
            // จำกัดข้อความในหน่วยความจำไว้ที่ 50 ข้อความ
            return newMessages.length > 50 ? newMessages.slice(-50) : newMessages;
          });
        } else {
          // เพิ่ม fallback message หาก API ไม่ตอบกลับ
          const errorMessage = {
            id: Date.now() + 1,
            text: 'ขออภัยครับ เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง',
            isBot: true,
            role: 'assistant' as const,
            timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
          };
          setChatMessages(prev => {
            const newMessages = [...prev, errorMessage];
            // จำกัดข้อความในหน่วยความจำไว้ที่ 50 ข้อความ
            return newMessages.length > 50 ? newMessages.slice(-50) : newMessages;
          });
        }
      } catch (error) {
        console.error('Error sending message:', error);
        
        // เพิ่ม error message ใน chat แทน Alert
        const errorMessage = {
          id: Date.now() + 2,
          text: 'เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่อีกครั้ง',
          isBot: true,
          role: 'assistant' as const,
          timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => {
          const newMessages = [...prev, errorMessage];
          // จำกัดข้อความในหน่วยความจำไว้ที่ 50 ข้อความ
          return newMessages.length > 50 ? newMessages.slice(-50) : newMessages;
        });
      } finally {
        setIsSending(false);
      }
    }
  };

  const clearHistory = async () => {
    Alert.alert(
      'ล้างประวัติการสนทนา',
      'คุณต้องการล้างประวัติการสนทนาทั้งหมดหรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ล้าง',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.clearChatHistory();
              await loadChatHistory(); // Reload to get fresh session
            } catch (error) {
              console.error('Error clearing chat history:', error);
              Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถล้างประวัติได้');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-primary px-4 pt-10 pb-1">
        <View className="flex-row items-center justify-between mb-2">
          <TouchableOpacity 
        onPress={() => navigation.goBack()}
        className="p-2"
          >
        <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View className="flex-row items-center">
        <Icon name="restaurant" size={28} color="white" />
        <Text className="text-2xl font-bold text-white ml-2">GoodMealChat</Text>
          </View>
          
          <TouchableOpacity onPress={clearHistory} className="p-2">
            <Icon name="trash-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Messages */}
      <ScrollView className="flex-1 px-4 py-2" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500">กำลังโหลดประวัติการสนทนา...</Text>
          </View>
        ) : (
          Array.isArray(chatMessages) && chatMessages.length > 0 ? chatMessages.map((msg, index) => (
            <View key={msg.id || index} className={`mb-6 ${msg.isBot ? 'items-center' : 'items-end'}`}>
              <View className={`${msg.isBot ? 'max-w-[90%]' : 'max-w-[80%]'} p-4 rounded-2xl ${
                msg.isBot 
                  ? 'bg-gray-50 rounded-bl-md' 
                  : 'bg-primary rounded-br-sm'
              }`}>
                {msg.isBot && (
                  <View className="flex-row items-center justify-start mb-2">
                    <Icon name="sparkles" size={18} color="#77DD77" />
                    <Text className="text-[#77DD77] text-sm font-semibold ml-2">GoodMeal AI</Text>
                  </View>
                )}
                <Text className={`text-base leading-6 ${msg.isBot ? 'text-gray-700 ' : 'text-white'}`}>
                  {msg.text || ''}
                </Text>
                <Text className={`text-xs mt-2 ${msg.isBot ? 'text-gray-400 text-center' : 'text-yellow-100'}`}>
                  {msg.timestamp || ''}
                </Text>
              </View>
            </View>
          )) : (
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-500">ยังไม่มีการสนทนา</Text>
            </View>
          )
        )}
        
        {isSending && (
          <View className="items-center mb-6">
            <View className="bg-gray-50 rounded-2xl rounded-bl-md p-4 max-w-[90%]">
              <View className="flex-row items-center justify-center mb-2">
                <Icon name="sparkles" size={18} color="#77DD77" />
                <Text className="text-[#77DD77] text-sm font-semibold ml-2">GoodMeal AI</Text>
              </View>
              <View className="flex-row items-center justify-center">
                <View className="w-2 h-2 bg-gray-400 rounded-full mr-1 animate-pulse"></View>
                <View className="w-2 h-2 bg-gray-400 rounded-full mr-1 animate-pulse"></View>
                <View className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></View>
                <Text className="text-gray-500 ml-3">กำลังพิมพ์...</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Chat Style Selector */}
      <View className="px-4 py-2 border-t border-gray-200">
        <Text className="text-myBlack text-sm mb-2">รูปแบบการสนทนา:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            className={`rounded-full px-4 py-2 mr-2 border ${
              selectedStyle === 'style1' 
                ? 'bg-primary border-primary' 
                : 'bg-gray-100 border border-transparent'
            }`}
            onPress={() => toggleChatStyle('style1')}
          >
            <Text className={`text-sm ${
              selectedStyle === 'style1' ? 'text-white' : 'text-gray-700'
            }`}>😊 เป็นมิตร</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`rounded-full px-4 py-2 mr-2 border ${
              selectedStyle === 'style2' 
                ? 'bg-primary border-primary' 
                : 'bg-gray-100 border-transparent'
            }`}
            onPress={() => toggleChatStyle('style2')}
          >
            <Text className={`text-sm ${
              selectedStyle === 'style2' ? 'text-white' : 'text-gray-700'
            }`}>👔 เป็นทางการ</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`rounded-full px-4 py-2 mr-2 border ${
              selectedStyle === 'style3' 
                ? 'bg-primary border-primary' 
                : 'bg-gray-100 border border-transparent'
            }`}
            onPress={() => toggleChatStyle('style3')}
          >
            <Text className={`text-sm ${
              selectedStyle === 'style3' ? 'text-white' : 'text-gray-700'
            }`}>😎 สบายๆ</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Message Input */}
      <View className="bg-white border-t border-gray-200 px-4 py-3">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
          <TextInput
            className="flex-1 text-gray-800 text-base"
            placeholder="แนะนำการกินเพื่อสุขภาพ..."
            placeholderTextColor="#9ca3af"
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            className="bg-primary rounded-full w-10 h-10 items-center justify-center ml-2"
            onPress={sendMessage}
            disabled={!message.trim() || isSending}
          >
            <Icon 
              name={isSending ? "hourglass" : "send"} 
              size={20} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
        
        {/* Start Button for initial interaction */}
        {chatMessages.length === 1 && (
          <TouchableOpacity
            className="bg-primary rounded-xl py-3 mt-3 items-center justify-center"
            onPress={() => setMessage('สวัสดีครับ ผมต้องการคำแนะนำเรื่องการกิน')}
          >
            <View className="flex-row items-center">
              <Icon name="chatbubbles" size={20} color="white" />
              <Text className="text-white font-bold text-lg ml-2">เริ่ม</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

     
    
    </SafeAreaView>
  );
};




export default ChatScreen;
