import { Request, Response } from 'express';
import db from '../db_config';
import axios from 'axios';
import { yearOfBirthToAge } from '../utils/ageCal';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const AI_API_KEY = process.env.AI_API_KEY;

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
  style?: string;
}

interface UserInfo {
  age?: number;
  weight?: number;
  height?: number;
  gender?: string;
  body_fat?: number;
  target_weight?: number;
  eating_type?: string;
  dietary_restrictions?: string[];
  additional_requirements?: string;
  activity_level?: string;
  summary?: string;
}

/**
 * Create system message based on chat style
 */
function createStyleSystemMessage(style: string, userInfo: UserInfo) {
  const {
    age, weight, height, gender, body_fat, target_weight,
    eating_type, dietary_restrictions, additional_requirements, 
    activity_level, summary
  } = userInfo;

  // Base prompt ที่ใช้ร่วมกัน
  const basePrompt = `คุณเป็น AI ผู้เชี่ยวชาญด้านโภชนาการและสุขภาพ ชื่อ "GoodMeal AI" 
  ให้คำแนะนำเกี่ยวกับ:
  - การกินเพื่อสุขภาพ
  - โภชนาการ
  - เมนูอาหาร
  - การลดน้ำหนัก
  - การเพิ่มกล้ามเนื้อ
  - วิธีทำอาหารเพื่อสุขภาพ
  
  โดยมีข้อมูลผู้ใช้ดังนี้:
  - อายุ: ${age} ปี
  - น้ำหนัก: ${weight} กิโลกรัม
  - ส่วนสูง: ${height} เซนติเมตร
  - เพศ: ${gender}
  - อัตราไขมันในร่างกาย: ${body_fat}%
  - น้ำหนักเป้าหมาย: ${target_weight} กิโลกรัม
  - ประเภทการกิน: ${eating_type}
  - ข้อจำกัดด้านอาหาร: ${dietary_restrictions}
  - ความต้องการเพิ่มเติม: ${additional_requirements}
  - ระดับกิจกรรม: ${activity_level}

  โดยมีข้อมูลสรุปการสนทนาที่ผ่านมาดังนี้:
  - สรุป: ${summary || 'ไม่มีข้อมูลสรุป'}`;

  // Style-specific prompts
  const stylePrompts = {
    style1: `${basePrompt}
    
    🎯 รูปแบบการสนทนา: เป็นมิตรและให้กำลังใจ
    - ใช้น้ำเสียงอบอุ่น เป็นกันเอง
    - เรียกผู้ใช้ว่า "คุณ" หรือ "น้อง"
    - ใช้อิโมจิประกอบ
    - ให้กำลังใจและสนับสนุน
    - ตอบเป็นภาษาไทยเสมอ`,

    style2: `${basePrompt}
    
    🎯 รูปแบบการสนทนา: เป็นทางการและเชี่ยวชาญ
    - ใช้น้ำเสียงเป็นทางการ แต่ไม่เย็นชา
    - เรียกผู้ใช้ว่า "คุณ" หรือ "ท่าน"
    - มุ่งเน้นข้อมูลทางวิทยาศาสตร์
    - อ้างอิงข้อมูลที่เชื่อถือได้
    - ใช้คำศัพท์ทางการแพทย์และโภชนาการ
    - ตอบเป็นภาษาไทยเสมอ`,

    style3: `${basePrompt}
    
    🎯 รูปแบบการสนทนา: สบายๆ และเข้าถึงง่าย
    - ใช้น้ำเสียงสบายๆ เหมือนเพื่อน
    - เรียกผู้ใช้ว่า "เธอ" หรือ "นาย/นาง"
    - ใช้ภาษาง่ายๆ เข้าใจง่าย
    - หลีกเลี่ยงคำศัพท์เทคนิค
    - ให้ตัวอย่างจากชีวิตประจำวัน
    - ตอบเป็นภาษาไทยเสมอ`
  };

  const selectedPrompt = stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.style1;

  return {
    role: 'system',
    content: selectedPrompt
  };
}

const getUserInfo = async (userId: number) => {
  try {
    const user = await db('users').where({ id: userId }).first();
    if (!user) {
      throw new Error('User not found');
    }
    return {
      age: user.age ? yearOfBirthToAge(user.age) : null,
      weight: user.weight,
      height: user.height,
      gender: user.gender,
      body_fat: user.body_fat,
      target_weight: user.target_weight,
      eating_type: user.eating_type,
      dietary_restrictions: user.dietary_restrictions,
      additional_requirements: user.additional_requirements || undefined,
      activity_level: user.activity_level,
    };
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw error;
  }
};

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

    let session = await db('chat_session')
      .where({ user_id: userId })
      .first();

    // If no session exists, create one
    if (!session) {
      await db('chat_session').insert({
        user_id: userId,
        started_at: new Date(),
        updated_at: new Date(),
        style: 'style1' // default style
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

export const updateChatStyle = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { style } = req.body;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'ไม่พบข้อมูลผู้ใช้'
      });
      return;
    }

    if (!style || !['style1', 'style2', 'style3'].includes(style)) {
      res.status(400).json({
        success: false,
        error: 'รูปแบบการสนทนาไม่ถูกต้อง'
      });
      return;
    }

    // Check if session exists
    let session = await db('chat_session')
      .where({ user_id: userId })
      .first();

    if (!session) {
      // Create new session with style
      await db('chat_session').insert({
        user_id: userId,
        started_at: new Date(),
        updated_at: new Date(),
        style: style
      });
    } else {
      // Update existing session
      await db('chat_session')
        .where({ user_id: userId })
        .update({
          style: style,
          updated_at: new Date()
        });
    }

    res.status(200).json({
      success: true,
      message: `อัปเดตรูปแบบการสนทนาเป็น ${style} เรียบร้อยแล้ว`,
      style: style
    });

  } catch (error) {
    console.error('Error updating chat style:', error);
    res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการอัปเดตรูปแบบการสนทนา'
    });
  }
};


export const getChatMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { limit = 30, offset = 0 } = req.query;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'ไม่พบข้อมูลผู้ใช้'
      });
      return;
    }

    const messages = await db('chat_message')
      .where({ user_id: userId })
      .orderBy('created_at', 'asc')
      .limit(Number(limit))
      .offset(Number(offset));

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


    const aiResponse = await getAiResponse(message.trim(), userId);

    // Save AI response
    const aiMessageData: ChatMessage = {
      user_id: userId,
      role: 'assistant',
      message: aiResponse
    };

    await db('chat_message').insert(aiMessageData);

    // Generate rolling summary after saving both messages
    await generateRollingSummary(userId);

    await db('chat_session')
      .where({ user_id: userId })
      .update({ updated_at: new Date() });

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

    console.log(`💬 [GoodChat] User ${userId}: "${message.trim()}" -> AI: "${aiResponse.substring(0, 50)}..."`);

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
 * Get AI response from OpenAI API
 */
async function getAiResponse(userMessage: string, userId: number): Promise<string> {
  try {

    if (!AI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const recentMessages = await db('chat_message')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc')
      .limit(8) 
      .select('role', 'message');

    const session = await db('chat_session')
      .where({ user_id: userId })
      .first();
    
    const { summary, style } = session || {};

    const { age, weight, height, gender, body_fat, target_weight,
       eating_type, dietary_restrictions, additional_requirements, 
       activity_level } = await getUserInfo(userId);

    const conversationHistory = recentMessages.reverse().map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.message
    }));

    // สร้าง system message ตาม style
    const systemMessage = createStyleSystemMessage(style || 'style1', {
      age: age || undefined, 
      weight: weight || undefined, 
      height: height || undefined, 
      gender, 
      body_fat: body_fat || undefined, 
      target_weight: target_weight || undefined,
      eating_type, 
      dietary_restrictions, 
      additional_requirements, 
      activity_level, 
      summary
    });

    const messages = [
      systemMessage,
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    // Call OpenAI API
    const response = await axios.post(OPENAI_API_URL, {
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
      top_p: 0.9
    }, {
      headers: {
        'Authorization': `Bearer ${AI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    const aiResponse = response.data.choices?.[0]?.message?.content?.trim();
    
    if (!aiResponse) {
      return 'ขออภัยครับ เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง';
    }

    return aiResponse;

  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    
    // Fallback response if AI API fails
    return generateFallbackResponse();
  }
}

/**
 * Generate rolling summary for conversation context
 */
async function generateRollingSummary(userId: number): Promise<string> {
  try {
    if (!AI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // ดึง summary เก่า
    const getSummary = await db('chat_session')
      .where({ user_id: userId })
      .first();
    
    const oldSummary = getSummary?.summary || "";

    // ดึงข้อความใหม่ (recent messages ที่ยังไม่ได้สรุป)
    const recentMessages = await db('chat_message')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc')
      .limit(6) // ดึง 6 ข้อความล่าสุด (3 คู่ user-assistant)
      .select('role', 'message');

    // จัดให้อยู่ในรูป { role: 'user' | 'assistant', content: string }
    const newMessages = recentMessages.reverse().map(msg => ({
      role: msg.role,
      content: msg.message
    }));

    // สร้าง prompt ให้ AI สรุป
    const systemMessage = {
      role: 'system',
      content: `คุณคือ AI ที่ทำหน้าที่สรุปบทสนทนา ให้เหลือเฉพาะประเด็นสำคัญ เนื้อหาหลัก และไม่จำเป็นต้องใส่คำพูดซ้ำ
      สรุปให้กระชับ เข้าใจง่าย และครอบคลุมประเด็นสำคัญของการสนทนา`
    };

    const userPrompt = `นี่คือบทสรุปเดิม:
${oldSummary}

ข้อความใหม่:
${newMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

โปรดสรุปเป็นบทสรุปใหม่ที่รวมทั้งสองส่วน โดยเก็บเฉพาะประเด็นสำคัญและข้อมูลที่เป็นประโยชน์`;

    const userMessage = {
      role: 'user',
      content: userPrompt
    };

    // เรียก OpenAI API
    const response = await axios.post(OPENAI_API_URL, {
      model: 'gpt-3.5-turbo',
      messages: [systemMessage, userMessage],
      max_tokens: 250, // ปรับ max_tokens พอเหมาะ
      temperature: 0, // temperature: 0 เพื่อให้สรุปตรงและไม่สุ่ม
      top_p: 1
    }, {
      headers: {
        'Authorization': `Bearer ${AI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // รับผลลัพธ์จาก AI
    const newSummary = response.data.choices?.[0]?.message?.content?.trim();
    
    if (!newSummary) {
      console.warn('Failed to generate summary, keeping old summary');
      return oldSummary;
    }

    // เก็บ summary ใหม่ลง DB
    await db('chat_session')
      .where({ user_id: userId })
      .update({ 
        summary: newSummary,
        updated_at: new Date()
      });

    console.log(`📝 [Rolling Summary] Updated for user ${userId}: "${newSummary.substring(0, 100)}..."`);
    
    return newSummary;

  } catch (error) {
    console.error('Error generating rolling summary:', error);
    
    // ถ้าเกิด error ให้คืนค่า summary เก่า
    const getSummary = await db('chat_session')
      .where({ user_id: userId })
      .first();
    
    return getSummary?.summary || "";
  }
}

/**
 * Generate fallback response when AI API is unavailable
 */
function generateFallbackResponse() {

  return 'ขอโทษครับ เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง';
}

/**
 * Get current conversation summary
 */
export const getConversationSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'ไม่พบข้อมูลผู้ใช้'
      });
      return;
    }

    const session = await db('chat_session')
      .where({ user_id: userId })
      .first();

    res.status(200).json({
      success: true,
      data: {
        summary: session?.summary || 'ยังไม่มีบทสรุปการสนทนา',
        updated_at: session?.updated_at
      }
    });

  } catch (error) {
    console.error('Error getting conversation summary:', error);
    res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการดึงบทสรุปการสนทนา'
    });
  }
};

/**
 * Manually trigger rolling summary generation
 */
export const triggerRollingSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'ไม่พบข้อมูลผู้ใช้'
      });
      return;
    }

    const newSummary = await generateRollingSummary(userId);

    res.status(200).json({
      success: true,
      data: {
        summary: newSummary,
        message: 'สร้างบทสรุปการสนทนาเรียบร้อยแล้ว'
      }
    });

  } catch (error) {
    console.error('Error triggering rolling summary:', error);
    res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการสร้างบทสรุปการสนทนา'
    });
  }
};


export const checkAiHealth = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!AI_API_KEY) {
      res.status(200).json({
        success: true,
        data: {
          openai_available: false,
          api_key_configured: false,
          fallback_mode: true,
          error: 'OpenAI API key not configured'
        }
      });
      return;
    }
    const response = await axios.post(OPENAI_API_URL, {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 5
    }, {
      headers: {
        'Authorization': `Bearer ${AI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    res.status(200).json({
      success: true,
      data: {
        openai_available: true,
        api_key_configured: true,
        model: 'gpt-3.5-turbo',
        status: 'healthy'
      }
    });

  } catch (error) {
    console.error('OpenAI health check failed:', error);
    res.status(200).json({
      success: true,
      data: {
        openai_available: false,
        api_key_configured: !!AI_API_KEY,
        fallback_mode: true,
        error: 'OpenAI API not reachable'
      }
    });
  }
};
