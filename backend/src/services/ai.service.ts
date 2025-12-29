import axios from 'axios';
import { AIChat, IAIChatMessage } from '../models/AIChat.model';
import { Activity } from '../models/Activity.model';
import { ClientProfile } from '../models/ClientProfile.model';
import { AppError } from '../middleware/errorHandler';

const AI_API_URL = process.env.AI_API_URL || 'https://api.openai.com/v1';
const AI_API_KEY = process.env.AI_API_KEY || '';

interface ChatCompletionMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const chatWithAI = async (
  userId: string,
  message: string,
  chatHistory?: IAIChatMessage[]
): Promise<string> => {
  try {
    // Fallback response if AI API is not configured
    if (!AI_API_KEY || AI_API_KEY === '') {
      const fallbackResponses = [
        'Merhaba! Size nasıl yardımcı olabilirim? Lütfen sorunuzu detaylı bir şekilde açıklayın.',
        'Anladım. Bu konuda size yardımcı olmak isterim. Daha fazla bilgi verebilir misiniz?',
        'Bu önemli bir konu. Size destek olmak için buradayım. Sorunuzu biraz daha açıklayabilir misiniz?',
      ];
      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      // Save to database even with fallback
      let chat = await AIChat.findOne({ user: userId }).sort({ createdAt: -1 });
      if (!chat) {
        chat = await AIChat.create({
          user: userId,
          messages: [],
        });
      }
      
      chat.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date(),
      });
      chat.messages.push({
        role: 'assistant',
        content: randomResponse + ' (Not: AI servisi şu anda yapılandırılmamış. Lütfen yöneticiye başvurun.)',
        timestamp: new Date(),
      });
      
      await chat.save();
      
      return randomResponse + ' (Not: AI servisi şu anda yapılandırılmamış. Lütfen yöneticiye başvurun.)';
    }

    const systemPrompt = `Sen KIEL-AI-FULL platformunun psikolojik ve eğitimsel destek asistanısın. 
Ailelere ve çocuklara yardımcı olmak için buradasın. 
Kibar, anlayışlı ve destekleyici bir dil kullan. 
Türkçe yanıt ver.`;

    const messages: ChatCompletionMessage[] = [
      { role: 'system', content: systemPrompt },
    ];

    // Add chat history
    if (chatHistory && chatHistory.length > 0) {
      chatHistory.slice(-10).forEach(msg => {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      });
    }

    // Add current message
    messages.push({ role: 'user', content: message });

    const response = await axios.post(
      `${AI_API_URL}/chat/completions`,
      {
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 500,
      },
      {
        headers: {
          'Authorization': `Bearer ${AI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const aiResponse = response.data.choices[0]?.message?.content || 'Üzgünüm, bir hata oluştu.';

    // Save to database
    let chat = await AIChat.findOne({ user: userId }).sort({ createdAt: -1 });
    if (!chat) {
      chat = await AIChat.create({
        user: userId,
        messages: [],
      });
    }

    chat.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });
    chat.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
    });

    await chat.save();

    return aiResponse;
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    if (error.response) {
      throw new AppError(`AI API Error: ${error.response.data?.error?.message || 'Unknown error'}`, 500);
    }
    throw new AppError('Failed to get AI response', 500);
  }
};

export const summarizeContent = async (content: string): Promise<string> => {
  try {
    // Fallback if AI API is not configured
    if (!AI_API_KEY || AI_API_KEY === '') {
      // Simple text summarization - take first 200 characters
      const summary = content.substring(0, 200).trim();
      return summary + (content.length > 200 ? '...' : '') + ' (Not: AI servisi yapılandırılmamış, basit özet kullanıldı.)';
    }

    const prompt = `Aşağıdaki içeriği Türkçe olarak özetle. Özet kısa ve öz olsun, önemli noktaları içersin:\n\n${content}`;

    const response = await axios.post(
      `${AI_API_URL}/chat/completions`,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Sen bir içerik özetleme asistanısın. Türkçe yanıt ver.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 300,
      },
      {
        headers: {
          'Authorization': `Bearer ${AI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0]?.message?.content || 'Özet oluşturulamadı.';
  } catch (error: any) {
    console.error('AI Summarization Error:', error);
    throw new AppError('Failed to summarize content', 500);
  }
};

export const recommendActivities = async (userId: string): Promise<string[]> => {
  try {
    const clientProfile = await ClientProfile.findOne({ user: userId });
    if (!clientProfile) {
      throw new AppError('Client profile not found', 404);
    }

    const childAge = clientProfile.childAge || 5;
    const interests = clientProfile.childInterests || [];

    // Rule-based filtering
    let query: any = {
      'ageRange.min': { $lte: childAge },
      'ageRange.max': { $gte: childAge },
    };

    // If interests exist, try to match category
    if (interests.length > 0) {
      query.$or = [
        { category: { $in: interests } },
        { tags: { $in: interests } },
      ];
    }

    let activities = await Activity.find(query).limit(10);

    // If not enough activities, get more without category filter
    if (activities.length < 5) {
      const moreActivities = await Activity.find({
        'ageRange.min': { $lte: childAge },
        'ageRange.max': { $gte: childAge },
      })
        .limit(10 - activities.length);
      activities = [...activities, ...moreActivities];
    }

    // Use AI to rank and recommend if API is available
    if (AI_API_KEY && activities.length > 0) {
      try {
        const activityList = activities.map(a => `${a.title} (${a.category}, ${a.difficulty})`).join('\n');
        const prompt = `Çocuk yaşı: ${childAge}, İlgi alanları: ${interests.join(', ')}\n\nAşağıdaki aktivitelerden en uygun 5 tanesini seç ve sırala:\n${activityList}`;

        const response = await axios.post(
          `${AI_API_URL}/chat/completions`,
          {
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'Sen bir aktivite öneri asistanısın. Sadece aktivite başlıklarını listele.' },
              { role: 'user', content: prompt },
            ],
            temperature: 0.5,
            max_tokens: 200,
          },
          {
            headers: {
              'Authorization': `Bearer ${AI_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const aiRecommendations = response.data.choices[0]?.message?.content || '';
        // Parse AI response to get activity titles
        const recommendedTitles = aiRecommendations
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .slice(0, 5);

        // Match titles to activities
        const recommended = recommendedTitles
          .map(title => activities.find(a => title.includes(a.title)))
          .filter(a => a !== undefined)
          .map(a => a!._id.toString());

        if (recommended.length > 0) {
          return recommended;
        }
      } catch (error) {
        console.error('AI Recommendation Error:', error);
        // Fall through to return rule-based recommendations
      }
    }

    // Return rule-based recommendations
    return activities.slice(0, 5).map(a => a._id.toString());
  } catch (error) {
    console.error('Recommendation Error:', error);
    throw new AppError('Failed to get recommendations', 500);
  }
};

