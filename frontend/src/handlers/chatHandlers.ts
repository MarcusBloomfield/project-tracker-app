import { ipcMain } from 'electron';
import axios from 'axios';

export function initChatHandlers() {
  // Handle chat messages to OpenAI API
  ipcMain.handle('chat:send-message', async (event, { messages, systemPrompt }) => {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      
      if (!apiKey) {
        throw new Error('OpenAI API key not found in environment variables. Please set OPENAI_API_KEY in your environment.');
      }

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages
          ],
          max_tokens: 800,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        message: response.data.choices[0].message.content
      };
    } catch (error: any) {
      console.error('Error in chat handler:', error);
      
      let errorMessage = 'Unknown error occurred';
      
      if (error?.response) {
        errorMessage = `API Error (${error.response.status}): ${error.response.data?.error?.message || error.response.statusText}`;
      } else if (error?.request) {
        errorMessage = 'Network error - unable to reach OpenAI API. Check your internet connection.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  });
}