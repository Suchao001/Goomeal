import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  StatusBar, 
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform
} from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/Ionicons';
import { isValidUrl, formatUrlForDisplay, addHttpsIfNeeded, getUserAgent } from '../utils/browserUtils';

interface InAppBrowserProps {
  isVisible: boolean;
  url: string;
  title?: string;
  onClose: () => void;
}

const { height: screenHeight } = Dimensions.get('window');

const InAppBrowser: React.FC<InAppBrowserProps> = ({
  isVisible,
  url,
  title,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const webViewRef = useRef<WebView | null>(null);

  // Reset states when modal opens/closes
  useEffect(() => {
    if (isVisible && url) {
      setLoading(true);
      setCanGoBack(false);
      setCanGoForward(false);
      setCurrentUrl(url);
    } else if (!isVisible) {
      setLoading(false);
      setCanGoBack(false);
      setCanGoForward(false);
      setCurrentUrl('');
    }
  }, [isVisible, url]);

  // Validate and format URL
  const formattedUrl = addHttpsIfNeeded(url);
  const displayUrl = formatUrlForDisplay(currentUrl || formattedUrl);

  const handleNavigationStateChange = (navState: any) => {
    try {
      setCanGoBack(navState.canGoBack || false);
      setCanGoForward(navState.canGoForward || false);
      setCurrentUrl(navState.url || '');
    } catch (error) {
      console.error('Navigation state change error:', error);
    }
  };

  const handleLoadStart = () => {
    try {
      setLoading(true);
    } catch (error) {
      console.error('Load start error:', error);
    }
  };

  const handleLoadEnd = () => {
    try {
      setLoading(false);
    } catch (error) {
      console.error('Load end error:', error);
    }
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error: ', nativeEvent);
    setLoading(false);
    Alert.alert(
      'ข้อผิดพลาด',
      'ไม่สามารถโหลดหน้าเว็บได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
      [{ text: 'ตกลง' }]
    );
  };

  const goBack = () => {
    if (webViewRef.current && canGoBack) {
      webViewRef.current.goBack();
    }
  };

  const goForward = () => {
    if (webViewRef.current && canGoForward) {
      webViewRef.current.goForward();
    }
  };

  const reload = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const share = () => {
    // You can implement share functionality here
    Alert.alert('แชร์', 'ฟีเจอร์แชร์จะพร้อมใช้งานเร็วๆ นี้');
  };

  // Don't render if no URL provided
  if (!url || url.trim() === '') {
    return null;
  }

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        
        {/* Header */}
        <View className="bg-white border-b border-gray-200 px-4 py-3">
          <View className="flex-row items-center justify-between">
            {/* Left side - Close button */}
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
            >
              <Icon name="close" size={20} color="#374151" />
            </TouchableOpacity>

            {/* Center - Title */}
            <View className="flex-1 mx-4">
              <Text 
                className="text-lg font-promptSemiBold text-gray-800 text-center"
                numberOfLines={1}
              >
                {title || 'บทความ'}
              </Text>
              <Text 
                className="text-xs text-gray-500 text-center"
                numberOfLines={1}
              >
                {displayUrl}
              </Text>
            </View>

            {/* Right side - Share button */}
            <TouchableOpacity
              onPress={share}
              className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
            >
              <Icon name="share-outline" size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Navigation Controls */}
          <View className="flex-row items-center justify-center mt-3 space-x-4">
            <TouchableOpacity
              onPress={goBack}
              disabled={!canGoBack}
              className={`w-10 h-10 items-center justify-center rounded-full ${
                canGoBack ? 'bg-blue-100' : 'bg-gray-100'
              }`}
            >
              <Icon 
                name="arrow-back" 
                size={20} 
                color={canGoBack ? '#3b82f6' : '#9ca3af'} 
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={goForward}
              disabled={!canGoForward}
              className={`w-10 h-10 items-center justify-center rounded-full ${
                canGoForward ? 'bg-blue-100' : 'bg-gray-100'
              }`}
            >
              <Icon 
                name="arrow-forward" 
                size={20} 
                color={canGoForward ? '#3b82f6' : '#9ca3af'} 
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={reload}
              className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
            >
              <Icon name="reload" size={20} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Loading Indicator */}
        {loading && (
          <View className="absolute top-32 left-0 right-0 z-10 items-center">
            <View className="bg-white rounded-lg shadow-lg px-4 py-3 flex-row items-center">
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text className="ml-2 text-gray-600 font-prompt">กำลังโหลด...</Text>
            </View>
          </View>
        )}

        {/* WebView */}
        <View className="flex-1">
          <WebView
            ref={webViewRef}
            source={{ uri: formattedUrl }}
            onNavigationStateChange={handleNavigationStateChange}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onError={handleError}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            mixedContentMode="compatibility"
            thirdPartyCookiesEnabled={true}
            userAgent={getUserAgent(Platform.OS as 'ios' | 'android')}
            style={{ flex: 1 }}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default InAppBrowser;
