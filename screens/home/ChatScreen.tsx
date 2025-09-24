import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import Markdown from 'react-native-markdown-display';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../../hooks/Navigation';
import Menu from '../material/Menu';
import { apiClient } from '../../utils/apiClient';
import { useAuth } from 'AuthContext';

const ChatScreen = () => {
  const [message, setMessage] = useState('');
  const navigation = useTypedNavigation<'ChatScreen'>();
  const { fetchUserProfile } = useAuth();
  const [firstTimeSetting, setFirstTimeSetting] = useState<boolean | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  type ChatStyle = 'style1' | 'style2';
  const [selectedStyle, setSelectedStyle] = useState<ChatStyle>('style1');
  const [showStyle2Info, setShowStyle2Info] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Fetch user profile to check first_time_setting
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await fetchUserProfile();
        setFirstTimeSetting(!!profile?.first_time_setting === true);
      } catch (e) {
        setFirstTimeSetting(null);
      }
    };
    fetchProfile();
  }, []);

  
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
      if (session.style && ['style1', 'style2'].includes(session.style)) {
        const style = session.style as ChatStyle;
        setSelectedStyle(style);
        setShowStyle2Info(style === 'style2');
      } else if (session.style === 'style3') {
        setSelectedStyle('style1');
        setShowStyle2Info(false);
      }
    } catch (error) {
      console.error('Error loading chat style:', error);
    }
  };

const toggleChatStyle = async (style: ChatStyle) => {
  try {
    setSelectedStyle(style);
    await apiClient.updateChatStyle(style);
  } catch (error) {
    console.error('Error updating chat style:', error);
    Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเปลี่ยนรูปแบบการสนทนาได้');
  }
};

  const handleSelectStyle = (style: ChatStyle) => {
    toggleChatStyle(style);
  
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

  const enhancedMarkdownStyles = {
  body: {
    color: '#1f2937',
    fontFamily: 'Prompt-Regular',
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 0,
  },
  
  paragraph: {
    marginTop: 0,
    marginBottom: 8,
    color: '#374151',
    lineHeight: 22,
  },
  
  // Headers with gradient-like colors
  heading1: {
    color: '#059669',
    fontFamily: 'Prompt-Bold',
    fontSize: 20,
    lineHeight: 28,
    marginTop: 6,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#d1fae5',
    paddingBottom: 4,
  },
  
  heading2: {
    color: '#0d9488',
    fontFamily: 'Prompt-Bold',
    fontSize: 18,
    lineHeight: 26,
    marginTop: 12,
    marginBottom: 6,
    paddingLeft: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#5eead4',
  },
  
  heading3: {
    color: '#0f766e',
    fontFamily: 'Prompt-Bold',
    fontSize: 17,
    lineHeight: 24,
    marginTop: 10,
    marginBottom: 6,
    backgroundColor: '#f0fdfa',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  
  heading4: {
    color: '#115e59',
    fontFamily: 'Prompt-SemiBold',
    fontSize: 16,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 4,
  },
  
  // Lists with better spacing
  list_item: {
    fontFamily: 'Prompt-Regular',
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
    marginBottom: 4,
    paddingLeft: 2,
  },
  
  bullet_list: {
    marginTop: 6,
    marginBottom: 8,
    paddingLeft: 2,
  },
  
  ordered_list: {
    marginTop: 6,
    marginBottom: 8,
    paddingLeft: 2,
  },
  
  // Enhanced text formatting
  strong: {
    fontFamily: 'Prompt-Bold',
    color: '#059669'
  },
  
  em: {
    fontFamily: 'Prompt-Italic',
    color: '#0d9488'
  },
  
  // Beautiful links
  link: {
    color: '#2563eb',
    fontFamily: 'Prompt-Medium',
    textDecorationColor: '#93c5fd'
  },
  
  // Code styling
  code_inline: {
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
    fontFamily: 'Courier New',
    fontSize: 14,
    color: '#dc2626',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  
  code_block: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    fontFamily: 'Courier New',
    fontSize: 13,
    color: '#e2e8f0',
    borderLeftWidth: 3,
    borderLeftColor: '#0ea5e9',
  },
  
  // Blockquote styling
  blockquote: {
    backgroundColor: '#fef3c7',
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 8,
    fontFamily: 'Prompt-Regular',
    fontStyle: 'italic',
    color: '#92400e',
  },
  
  // Table styling
  table: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginVertical: 8
  },
  
  thead: {
    backgroundColor: '#f3f4f6',
  },
  
  th: {
    fontFamily: 'Prompt-Bold',
    color: '#1f2937',
    fontSize: 15,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    textAlign: 'center',
  },
  
  td: {
    fontFamily: 'Prompt-Regular',
    color: '#374151',
    fontSize: 14,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    textAlign: 'left',
  },
  
  tr: {
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  
  // Horizontal rule
  hr: {
    backgroundColor: '#d1d5db',
    height: 2,
    marginVertical: 20,
    borderRadius: 1,
  },
  
  // Image styling
  image: {
    borderRadius: 12,
    marginVertical: 12,
  },
  
  // Text with background highlight
  textgroup: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 8,
    marginVertical: 4,
  },
};

  // Render a different screen if firstTimeSetting is false
  if (firstTimeSetting === false) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
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
            <View className="w-10" /> {/* Spacer for symmetry */}
          </View>
        </View>

        <View className="flex-1 items-center justify-center p-6">
          <View className="bg-white rounded-lg shadow-md shadow-slate-600 p-6 w-full items-center">
            <View className="w-16 h-16 bg-orange-100 rounded-full items-center justify-center mb-4">
              <Icon name="information-circle" size={40} color="#f59e0b" />
            </View>
            <Text className="text-lg font-promptBold text-gray-800 text-center mb-2">
              กรุณากรอกข้อมูลส่วนตัว
            </Text>
            <Text className="text-base font-prompt text-gray-600 text-center mb-6">
              คุณจำเป็นต้องกรอกข้อมูลส่วนตัวก่อน เพื่อให้เราสามารถให้คำแนะนำด้านโภชนาการที่เหมาะสมกับคุณ
            </Text>
            <TouchableOpacity
              className="bg-primary px-6 py-3 rounded-full"
              onPress={() => navigation.navigate('PersonalSetup')}
            >
              <Text className="text-white font-promptSemiBold">กรอกข้อมูลเลย</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
                  <Markdown style={enhancedMarkdownStyles}>
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
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-myBlack text-sm font-promptMedium">รูปแบบการสนทนา:</Text>
          {selectedStyle === 'style2' && !showStyle2Info && (
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => setShowStyle2Info(true)}
            >
              <Icon name="information-circle-outline" size={18} color="#6b7280" />
              <Text className="ml-2 text-sm text-gray-500 font-promptMedium">
                ดูคำอธิบาย
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            className={`rounded-full px-4 py-2 mr-2 border ${
              selectedStyle === 'style1' 
                ? 'bg-primary border-primary' 
                : 'bg-gray-100 border border-transparent'
            }`}
            onPress={() => handleSelectStyle('style1')}
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
            onPress={() => handleSelectStyle('style2')}
          >
            <Text className={`text-sm font-promptMedium ${
              selectedStyle === 'style2' ? 'text-white' : 'text-gray-700'
            }`}>รู้เรื่องการกิน</Text>
          </TouchableOpacity>
        </ScrollView>
        {selectedStyle === 'style2' && showStyle2Info && (
          <View className="mt-3">
            <View className="mt-3">
              <View className=" border border-primary rounded-xl px-4 py-3">
             
                  <TouchableOpacity 
                    onPress={() => setShowStyle2Info(false)}
                    className="flex-row justify-between items-center"
                  >
                    <Text className="flex-1 text-sm text-gray-600 font-promptMedium">
                      รู้ข้อมูลการกินในสัปดาห์ล่าสุดช่วยให้คุณปรับการกินได้ดีขึ้น
                    </Text>
                    <Icon name="chevron-up" size={18} color="#ffb800" className="ml-2" />
                  </TouchableOpacity>
               
              </View>
            </View>
          </View>
        )}
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
