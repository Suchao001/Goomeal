import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../../hooks/Navigation';
import Menu from '../material/Menu';

/**
 * ChatScreen Component
 * หน้าแชท/สนทนา - สำหรับคุยกับ AI เพื่อแนะนำการกินเพื่อสุขภาพ
 */
const ChatScreen = () => {
  const [message, setMessage] = useState('');
  const navigation = useTypedNavigation<'Chat'>();
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      text: 'สวัสดีครับ! ผมเป็น AI ที่จะช่วยแนะนำการกินเพื่อสุขภาพและเมนูอาหารให้คุณ มีอะไรให้ช่วยไหมครับ?',
      isBot: true,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: chatMessages.length + 1,
        text: message,
        isBot: false,
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatMessages([...chatMessages, newMessage]);
      setMessage('');
      
      // Simulate bot response
      setTimeout(() => {
        const botResponse = {
          id: chatMessages.length + 2,
          text: 'ขอบคุณสำหรับคำถามครับ! ผมจะช่วยแนะนำเมนูอาหารเพื่อสุขภาพที่เหมาะกับคุณ',
          isBot: true,
          timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => [...prev, botResponse]);
      }, 1000);
    }
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
        <Icon name="arrow-back" size={24} color="#77DD77" />
          </TouchableOpacity>
          
          <View className="flex-row items-center">
        <Icon name="restaurant" size={28} color="#77DD77" />
        <Text className="text-2xl font-bold text-[#77DD77] ml-2">GoodMealChat</Text>
          </View>
          
          <View className="w-8" />
        </View>
      </View>

      {/* Chat Messages */}
      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        {chatMessages.map((msg) => (
          <View key={msg.id} className={`mb-4 ${msg.isBot ? 'items-start' : 'items-end'}`}>
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
                {msg.text}
              </Text>
              <Text className={`text-xs mt-1 ${msg.isBot ? 'text-gray-500' : 'text-yellow-100'}`}>
                {msg.timestamp}
              </Text>
            </View>
          </View>
        ))}
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
            disabled={!message.trim()}
          >
            <Icon 
              name="send" 
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
