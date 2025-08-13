import { Request, Response } from 'express';
import db from '../db_config';

interface ChatMessage {
  id?: number;
  user_id: number;
  role: 'user' | 'assistant' | 'system';
  message: string;
  created_at?: Date;
}

interface ChatSession {
  user_id: number;
  started_at?: Date;
  updated_at?: Date;
  summary?: string;
}

/**
 * Get or create chat session for user
 */
export const getChatSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'ไม่พบข้อมูลผู้ใช้'
      });
      return;
    }

    // Check if session exists
    let session = await db('chat_session')
      .where({ user_id: userId })
      .first();

    // If no session exists, create one
    if (!session) {
      await db('chat_session').insert({
        user_id: userId,
        started_at: new Date(),
        updated_at: new Date()
      });

      // Add initial system message
      await db('chat_message').insert({
        user_id: userId,
        role: 'assistant',
        message: 'สวัสดีครับ! ผมเป็น AI ที่จะช่วยแนะนำการกินเพื่อสุขภาพและเมนูอาหารให้คุณ มีอะไรให้ช่วยไหมครับ?'
      });

      // Get the newly created session
      session = await db('chat_session')
        .where({ user_id: userId })
        .first();
    }

    res.status(200).json({
      success: true,
      data: session
    });

  } catch (error) {
    console.error('Error getting chat session:', error);
    res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลเซสชัน'
    });
  }
};

/**
 * Get chat messages for user
 */
export const getChatMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { limit = 50, offset = 0 } = req.query;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'ไม่พบข้อมูลผู้ใช้'
      });
      return;
    }

    // Get messages ordered by creation time
    const messages = await db('chat_message')
      .where({ user_id: userId })
      .orderBy('created_at', 'asc')
      .limit(Number(limit))
      .offset(Number(offset));

    // Format messages for frontend
    const formattedMessages = messages.map((msg: any, index: number) => ({
      id: msg.id,
      text: msg.message,
      isBot: msg.role === 'assistant' || msg.role === 'system',
      role: msg.role,
      timestamp: new Date(msg.created_at).toLocaleTimeString('th-TH', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }));

    res.status(200).json({
      success: true,
      data: formattedMessages
    });

  } catch (error) {
    console.error('Error getting chat messages:', error);
    res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลข้อความ'
    });
  }
};

/**
 * Send message to chat
 */
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { message } = req.body;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'ไม่พบข้อมูลผู้ใช้'
      });
      return;
    }

    if (!message || !message.trim()) {
      res.status(400).json({
        success: false,
        error: 'กรุณาระบุข้อความ'
      });
      return;
    }

    // Ensure session exists
    let session = await db('chat_session')
      .where({ user_id: userId })
      .first();

    if (!session) {
      await db('chat_session').insert({
        user_id: userId,
        started_at: new Date(),
        updated_at: new Date()
      });
    }

    // Save user message
    const userMessageData: ChatMessage = {
      user_id: userId,
      role: 'user',
      message: message.trim()
    };

    await db('chat_message').insert(userMessageData);

    // Generate fixed AI response based on keywords
    const aiResponse = generateFixedResponse(message.trim());

    // Save AI response
    const aiMessageData: ChatMessage = {
      user_id: userId,
      role: 'assistant',
      message: aiResponse
    };

    await db('chat_message').insert(aiMessageData);

    // Update session timestamp
    await db('chat_session')
      .where({ user_id: userId })
      .update({ updated_at: new Date() });

    // Return both messages
    const userMsg = {
      id: Date.now(),
      text: message.trim(),
      isBot: false,
      role: 'user',
      timestamp: new Date().toLocaleTimeString('th-TH', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };

    const botMsg = {
      id: Date.now() + 1,
      text: aiResponse,
      isBot: true,
      role: 'assistant',
      timestamp: new Date().toLocaleTimeString('th-TH', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };

    res.status(200).json({
      success: true,
      data: {
        userMessage: userMsg,
        botMessage: botMsg
      }
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการส่งข้อความ'
    });
  }
};

/**
 * Clear chat history
 */
export const clearChatHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'ไม่พบข้อมูลผู้ใช้'
      });
      return;
    }

    // Delete all messages for user
    await db('chat_message')
      .where({ user_id: userId })
      .del();

    // Reset session or delete it
    await db('chat_session')
      .where({ user_id: userId })
      .del();

    res.status(200).json({
      success: true,
      message: 'ลบประวัติการสนทนาเรียบร้อยแล้ว'
    });

  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการลบประวัติการสนทนา'
    });
  }
};

/**
 * Generate fixed AI response based on user message
 * This is a simple keyword-based response system for testing
 */
function generateFixedResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  // Weight loss related
  if (lowerMessage.includes('ลดน้ำหนัก') || lowerMessage.includes('ผอม') || lowerMessage.includes('ลดความอ้วน')) {
    return 'สำหรับการลดน้ำหนัก แนะนำให้กินอาหารที่มีแคลอรี่ต่ำ เพิ่มผัก ผลไม้ และโปรตีนไม่ติดมัน เช่น ปลา ไก่ย่าง ไข่ต้ม และหลีกเลี่ยงของทอด ของหวาน และเครื่องดื่มที่มีน้ำตาลสูง';
  }
  
  // Protein related
  if (lowerMessage.includes('โปรตีน') || lowerMessage.includes('กล้ามเนื้อ') || lowerMessage.includes('เพิ่มกล้าม')) {
    return 'อาหารที่มีโปรตีนสูงที่แนะนำ ได้แก่ ไข่ไก่ ปลาแซลมอน ไก่อก เต้าหู้ ถั่วเหลือง นม โยเกิร์ต และถั่วต่างๆ ควรกินโปรตีน 1.2-2.0 กรัมต่อน้ำหนักตัว 1 กิโลกรัมต่อวัน';
  }
  
  // Healthy cooking
  if (lowerMessage.includes('ทำอาหาร') || lowerMessage.includes('วิธีทำ') || lowerMessage.includes('สูตร')) {
    return 'วิธีการทำอาหารเพื่อสุขภาพ: 1) ใช้น้ำมันน้อย เลือกน้ำมันมะกอก 2) นึ่ง ต้ม ย่าง แทนการทอด 3) เพิ่มผักและเครื่องเทศ 4) ลดเกลือและน้ำตาล 5) เลือกเนื้อสัตว์ไม่ติดมัน';
  }
  
  // Vegetables and fruits
  if (lowerMessage.includes('ผัก') || lowerMessage.includes('ผลไม้') || lowerMessage.includes('วิตามิน')) {
    return 'ผักและผลไม้ที่แนะนำสำหรับสุขภาพ: ผักใบเขียว บร็อกโคลี่ แครอท มะเขือเทศ แอปเปิ้ล กล้วย ส้ม ผลไม้เบอรี่ต่างๆ ควรกิน 5-9 ส่วนต่อวัน';
  }
  
  // Water and hydration
  if (lowerMessage.includes('น้ำ') || lowerMessage.includes('ดื่ม') || lowerMessage.includes('เครื่องดื่ม')) {
    return 'ดื่มน้ำให้เพียงพอ 8-10 แก้วต่อวัน หลีกเลี่ยงเครื่องดื่มที่มีน้ำตาลสูง เลือกน้ำเปล่า ชาเขียว หรือน้ำผลไม้สดโดยไม่เติมน้ำตาล';
  }
  
  // General greeting
  if (lowerMessage.includes('สวัสดี') || lowerMessage.includes('หวัดดี') || lowerMessage.includes('ดีครับ') || lowerMessage.includes('ดีค่ะ')) {
    return 'สวัสดีครับ! ยินดีให้คำแนะนำเรื่องการกินเพื่อสุขภาพ มีคำถามอะไรเกี่ยวกับอาหาร โภชนาการ หรือการดูแลสุขภาพไหมครับ?';
  }
  
  // Default response
  return 'ขอบคุณสำหรับคำถามครับ! สำหรับคำแนะนำที่ตรงจุดมากขึ้น ลองถามเกี่ยวกับ "การลดน้ำหนัก", "อาหารโปรตีนสูง", "วิธีทำอาหารเพื่อสุขภาพ", "ผักผลไม้แนะนำ" หรือ "การดื่มน้ำ" ดูครับ';
}
