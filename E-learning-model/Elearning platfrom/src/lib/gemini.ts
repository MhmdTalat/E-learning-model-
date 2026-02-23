// Gemini AI Chat Service using Free API
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export const sendChatMessage = async (message: string, conversationHistory: ChatMessage[] = []): Promise<string> => {
  if (!GEMINI_API_KEY) {
    return 'Chatbot is not configured. Please add VITE_GEMINI_API_KEY to your .env file.';
  }

  try {
    // Build conversation context with proper format
    const systemPrompt = `You are a helpful assistant for an E-learning platform. You help users with:
- Questions about the platform features and navigation
- Instructor management and assignment
- Course enrollment and management
- General guidance on using the platform

Be concise, friendly, and helpful. Keep responses brief (2-3 sentences max).`;

    // Build the correct format for the API
    const parts: Array<{ text: string }> = [
      { text: systemPrompt + '\n\nUser: ' + message }
    ];

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: parts
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200,
        topP: 0.95,
        topK: 40
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_NONE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_NONE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_NONE'
        },
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_NONE'
        },
        {
          category: 'HARM_CATEGORY_CIVIC_INTEGRITY',
          threshold: 'BLOCK_NONE'
        }
      ]
    };

    console.log('Sending request to Gemini API...');
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      
      if (response.status === 400) {
        return 'API Configuration Error: Please verify your Gemini API key is valid. Visit https://aistudio.google.com/app/apikey to check.';
      }
      return `Sorry, I encountered an error. Please try again. (${response.status})`;
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates.length > 0) {
      const textContent = data.candidates[0].content?.parts?.[0]?.text;
      return textContent || 'Sorry, I could not generate a response.';
    }

    return 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Chat error:', error);
    return 'An error occurred while processing your message. Please try again.';
  }
};
