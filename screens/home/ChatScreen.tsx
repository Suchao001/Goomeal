import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import Markdown from 'react-native-markdown-display';
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
  const scrollViewRef = useRef<ScrollView>(null);

  
  useEffect(() => {
    loadChatHistory();
    loadChatStyle();
  }, []);

  
  useEffect(() => {
    if (scrollViewRef.current && chatMessages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages, isSending]);

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
      
      await apiClient.getChatSession();
      
      
      const messages = await apiClient.getChatMessages(30, 0);
      
      if (Array.isArray(messages)) {
        setChatMessages(messages);
      } else {
        setChatMessages([]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      
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
        
        
        const userMessage = {
          id: Date.now(), 
          text: message.trim(),
          isBot: false,
          role: 'user' as const,
          timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
        };
        
        
        setChatMessages(prev => {
          const newMessages = [...prev, userMessage];
          
          return newMessages.length > 50 ? newMessages.slice(-50) : newMessages;
        });
        setMessage(''); 
        
        
        const result = await apiClient.sendChatMessage(userMessage.text);
        
        
        
        if (result && result.botMessage) {
          setChatMessages(prev => {
            const newMessages = [...prev, result.botMessage];
            
            return newMessages.length > 50 ? newMessages.slice(-50) : newMessages;
          });
        } else if (result && result.userMessage && result.botMessage) {
          
          setChatMessages(prev => {
            const newMessages = [...prev, result.botMessage];
            
            return newMessages.length > 50 ? newMessages.slice(-50) : newMessages;
          });
        } else {
          
          const errorMessage = {
            id: Date.now() + 1,
            text: 'ขออภัยครับ เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง',
            isBot: true,
            role: 'assistant' as const,
            timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
          };
          setChatMessages(prev => {
            const newMessages = [...prev, errorMessage];
            
            return newMessages.length > 50 ? newMessages.slice(-50) : newMessages;
          });
        }
      } catch (error) {
        console.error('Error sending message:', error);
        
        
        const errorMessage = {
          id: Date.now() + 2,
          text: 'เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่อีกครั้ง',
          isBot: true,
          role: 'assistant' as const,
          timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => {
          const newMessages = [...prev, errorMessage];
          
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
              await loadChatHistory(); 
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
        <Text className="text-2xl font-promptBold text-white ml-2">GoodMealChat</Text>
          </View>
          
          <TouchableOpacity onPress={clearHistory} className="p-2">
            <Icon name="trash-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Messages */}
      <ScrollView 
        ref={scrollViewRef}
        className="flex-1  " 
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500 font-promptRegular">กำลังโหลดประวัติการสนทนา...</Text>
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
                    <Text className="text-[#77DD77] text-sm font-promptSemiBold ml-2">GoodMeal AI</Text>
                  </View>
                )}
                {msg.isBot ? (
                  <Markdown
                    style={{
                      body: {
                        color: '#374151',
                        fontFamily: 'Prompt-Regular',
                        fontSize: 16,
                        lineHeight: 24,
                      },
                      paragraph: {
                        marginTop: 0,
                        marginBottom: 0,
                      },
                      link: {
                        color: '#2563eb',
                      },
                      code_inline: {
                        backgroundColor: '#f3f4f6',
                        borderRadius: 4,
                        paddingHorizontal: 4,
                        fontFamily: 'Prompt-Regular',
                      },
                    }}
                  >
                    {msg.text || ''}
                  </Markdown>
                ) : (
                  <Text
                    className="text-base leading-6 text-white"
                    style={{ fontFamily: 'Prompt-Regular' }}
                  >
                    {msg.text || ''}
                  </Text>
                )}
                {msg.isBot &&(
                  <Text 
                  className={`text-xs mt-2 ${msg.isBot ? 'text-gray-400 text-center' : 'text-gray-400'}`}
                  style={{ fontFamily: 'Prompt-Light' }}
                >
                  {msg.timestamp || ''}
                </Text>
                )}
                
              </View>
            </View>
          )) : (
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-500 font-promptRegular">ยังไม่มีการสนทนา</Text>
            </View>
          )
        )}
        
        {isSending && (
          <View className="items-center mb-6">
            <View className="bg-gray-50 rounded-2xl rounded-bl-md p-4 max-w-[90%]">
              <View className="flex-row items-center justify-center mb-2">
                <Icon name="sparkles" size={18} color="#77DD77" />
                <Text className="text-[#77DD77] text-sm font-promptSemiBold ml-2">GoodMeal AI</Text>
              </View>
              <View className="flex-row items-center justify-center">
                <View className="w-2 h-2 bg-gray-400 rounded-full mr-1 animate-pulse"></View>
                <View className="w-2 h-2 bg-gray-400 rounded-full mr-1 animate-pulse"></View>
                <View className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></View>
                <Text 
                  className="text-gray-500 ml-3"
                  style={{ fontFamily: 'Prompt-Regular' }}
                >
                  กำลังพิมพ์...
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Chat Style Selector */}
      <View className="px-4 py-2 border-t border-gray-200">
        <Text className="text-myBlack text-sm mb-2 font-promptMedium">รูปแบบการสนทนา:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            className={`rounded-full px-4 py-2 mr-2 border ${
              selectedStyle === 'style1' 
                ? 'bg-primary border-primary' 
                : 'bg-gray-100 border border-transparent'
            }`}
            onPress={() => toggleChatStyle('style1')}
          >
            <Text className={`text-sm font-promptMedium ${
              selectedStyle === 'style1' ? 'text-white' : 'text-gray-700'
            }`}>พูดคุยปกติ</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`rounded-full px-4 py-2 mr-2 border ${
              selectedStyle === 'style2' 
                ? 'bg-primary border-primary' 
                : 'bg-gray-100 border-transparent'
            }`}
            onPress={() => toggleChatStyle('style2')}
          >
            <Text className={`text-sm font-promptMedium ${
              selectedStyle === 'style2' ? 'text-white' : 'text-gray-700'
            }`}>รู้เรื่องการกิน</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`rounded-full px-4 py-2 mr-2 border ${
              selectedStyle === 'style3' 
                ? 'bg-primary border-primary' 
                : 'bg-gray-100 border border-transparent'
            }`}
            onPress={() => toggleChatStyle('style3')}
          >
           
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Message Input */}
      <View className="bg-white border-t border-gray-200 px-4 py-3">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
          <TextInput
            className="flex-1 text-gray-800 text-base"
            style={{ fontFamily: 'Prompt-Regular' }}
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
              <Text className="text-white font-promptBold text-lg ml-2">เริ่ม</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

     
    
    </SafeAreaView>
  );
};




export default ChatScreen;
