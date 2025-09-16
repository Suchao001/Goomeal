import { BaseApiClient } from './baseClient';

export interface ChatMessage {
  id: number;
  text: string;
  isBot: boolean;
  role: 'user' | 'assistant' | 'system';
  timestamp: string;
}

export interface ChatSession {
  user_id: number;
  started_at: string;
  updated_at: string;
  summary?: string;
  style?: 'style1' | 'style2' | 'style3';
}

export class GoodChatApiClient extends BaseApiClient {
  /**
   * Get or create chat session
   */
  async getChatSession(): Promise<ChatSession> {
    const response = await this.get('/api/goodchat/session');
    return response.data.data; 
  }

  /**
   * Get chat messages history
   */
  async getChatMessages(limit = 30, offset = 0): Promise<ChatMessage[]> {
    const response = await this.get(`/api/goodchat/messages?limit=${limit}&offset=${offset}`);
    return response.data.data; 
  }

  /**
   * Send message to chat
   */
  async sendMessage(message: string): Promise<{
    userMessage: ChatMessage;
    botMessage: ChatMessage;
  }> {
    const response = await this.post('/api/goodchat/message', { message });
    return response.data.data; 
  }

  /**
   * Clear chat history
   */
  async clearChatHistory(): Promise<{ message: string }> {
    const response = await this.delete('/api/goodchat/history');
    return response.data; 
  }

  /**
   * Update chat style
   */
  async updateChatStyle(style: string): Promise<{ message: string; style: string }> {
    const response = await this.post('/api/goodchat/style', { style });
    return response.data; 
  }
}
