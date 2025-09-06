import { useState } from 'react';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: '',
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
});

export function useVoiceProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);

  const processVoiceInput = async (audioBlob) => {
    setIsProcessing(true);
    
    try {
      // Convert audio blob to base64 for demo purposes
      // In production, you would send the actual audio file to OpenAI
      const reader = new FileReader();
      const audioData = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(audioBlob);
      });

      // Simulate speech-to-text transcription
      // In production, use OpenAI's Whisper API
      const mockTranscription = "Schedule a meeting with John tomorrow at 3 PM about the project review";

      // Parse the transcription using OpenAI
      const completion = await openai.chat.completions.create({
        model: "google/gemini-2.0-flash-001",
        messages: [
          {
            role: "system",
            content: `You are a task and calendar event parser. Analyze the user's spoken input and determine if it's a task or calendar event. 

For tasks, respond with JSON:
{
  "type": "task",
  "description": "the main task",
  "priority": "high|medium|low",
  "dueDate": "ISO date string if mentioned",
  "reminderSettings": { "enabled": boolean, "time": "ISO date string" }
}

For calendar events, respond with JSON:
{
  "type": "event",
  "title": "event title",
  "startTime": "ISO date string",
  "endTime": "ISO date string if mentioned",
  "location": "location if mentioned",
  "attendees": ["list of people"],
  "reminderSettings": { "enabled": boolean, "time": "ISO date string" }
}

Only respond with valid JSON, no other text.`
          },
          {
            role: "user",
            content: mockTranscription
          }
        ],
        temperature: 0.1,
      });

      const result = JSON.parse(completion.choices[0].message.content);
      
      // Process dates relative to current time
      if (result.dueDate || result.startTime) {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(15, 0, 0, 0); // 3 PM
        
        if (result.dueDate) result.dueDate = tomorrow.toISOString();
        if (result.startTime) result.startTime = tomorrow.toISOString();
        if (result.endTime) {
          const endTime = new Date(tomorrow);
          endTime.setHours(16, 0, 0, 0); // 4 PM
          result.endTime = endTime.toISOString();
        }
      }

      return result;
    } catch (error) {
      console.error('Voice processing error:', error);
      
      // Fallback response for demo
      return {
        type: 'task',
        description: 'Voice input received (demo mode)',
        priority: 'medium',
        dueDate: null,
        reminderSettings: { enabled: false }
      };
    } finally {
      setIsProcessing(false);
    }
  };

  return { processVoiceInput, isProcessing };
}