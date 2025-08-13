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

  // Load chat history when component mounts
  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      setIsLoading(true);
      // Get or create session first
      await apiClient.getChatSession();
      
      // Then get chat messages
      const messages = await apiClient.getChatMessages();
      console.log('Loaded chat messages:', messages);
      
      if (Array.isArray(messages)) {
        setChatMessages(messages);
      } else {
        console.warn('Messages is not an array:', messages);
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
        const result = await apiClient.sendChatMessage(message.trim());
        
        console.log('SendMessage result:', result);
        
        // Add both user and bot messages to the chat - access via result.data
        if (result && result.userMessage && result.botMessage) {
          setChatMessages(prev => [...prev, result.userMessage, result.botMessage]);
        } else {
          console.warn('Invalid result structure:', result);
        }
        setMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
        Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถส่งข้อความได้ กรุณาลองใหม่อีกครั้ง');
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
    <SafeAreaView className="flex-1 bg-gray-50">
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
      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500">กำลังโหลดประวัติการสนทนา...</Text>
          </View>
        ) : (
          Array.isArray(chatMessages) && chatMessages.length > 0 ? chatMessages.map((msg, index) => (
            <View key={msg.id || index} className={`mb-4 ${msg.isBot ? 'items-start' : 'items-end'}`}>
              <View className={`max-w-[80%] p-3 rounded-2xl ${
                msg.isBot 
                  ? 'bg-white border border-gray-200 rounded-bl-sm' 
                  : 'bg-primary rounded-br-sm'
              }`}>
                {msg.isBot && (
                  <View className="flex-row items-center mb-1">
                    <Icon name="chatbubble-ellipses" size={16} color="#77DD77" />
                    <Text className="text-[#77DD77] text-xs font-medium ml-1">GoodMeal AI</Text>
                  </View>
                )}
                <Text className={`text-base ${msg.isBot ? 'text-gray-800' : 'text-white'}`}>
                  {msg.text || ''}
                </Text>
                <Text className={`text-xs mt-1 ${msg.isBot ? 'text-gray-500' : 'text-yellow-100'}`}>
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
          <View className="items-start mb-4">
            <View className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm p-3 max-w-[80%]">
              <View className="flex-row items-center mb-1">
                <Icon name="chatbubble-ellipses" size={16} color="#77DD77" />
                <Text className="text-[#77DD77] text-xs font-medium ml-1">GoodMeal AI</Text>
              </View>
              <Text className="text-gray-500">กำลังพิมพ์...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Quick Suggestions */}
      <View className="px-4 py-2">
        <Text className="text-gray-600 text-sm mb-2">คำถามแนะนำ:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            className="bg-white border border-gray-200 rounded-full px-4 py-2 mr-2"
            onPress={() => setMessage('แนะนำเมนูอาหารเพื่อลดน้ำหนัก')}
          >
            <Text className="text-gray-700 text-sm">แนะนำเมนูอาหารเพื่อลดน้ำหนัก</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="bg-white border border-gray-200 rounded-full px-4 py-2 mr-2"
            onPress={() => setMessage('อาหารที่มีโปรตีนสูง')}
          >
            <Text className="text-gray-700 text-sm">อาหารที่มีโปรตีนสูง</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="bg-white border border-gray-200 rounded-full px-4 py-2 mr-2"
            onPress={() => setMessage('วิธีการทำอาหารเพื่อสุขภาพ')}
          >
            <Text className="text-gray-700 text-sm">วิธีการทำอาหารเพื่อสุขภาพ</Text>
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
