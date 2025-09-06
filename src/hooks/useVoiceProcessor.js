import { useState } from 'react';
import OpenAI from 'openai';
import { config } from '../config';
import { parseISO, addDays, addHours, addMinutes, setHours, setMinutes } from 'date-fns';
import toast from 'react-hot-toast';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
  baseURL: config.openai.baseURL,
  dangerouslyAllowBrowser: true,
});

export function useVoiceProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);

  const transcribeAudio = async (audioBlob) => {
    if (!config.openai.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      // Convert blob to file for OpenAI Whisper API
      const audioFile = new File([audioBlob], 'audio.wav', { type: 'audio/wav' });
      
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: config.openai.whisperModel,
        language: 'en',
        response_format: 'text'
      });

      return transcription;
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error('Failed to transcribe audio');
    }
  };

  const parseTranscription = async (transcription) => {
    try {
      const completion = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: "system",
            content: config.ai.systemPrompts.taskParser
          },
          {
            role: "user",
            content: transcription
          }
        ],
        temperature: config.ai.temperature,
        max_tokens: config.ai.maxTokens,
      });

      const result = JSON.parse(completion.choices[0].message.content);
      return processDateReferences(result, transcription);
    } catch (error) {
      console.error('Parsing error:', error);
      throw new Error('Failed to parse transcription');
    }
  };

  const processDateReferences = (result, transcription) => {
    const now = new Date();
    const lowerTranscription = transcription.toLowerCase();

    // Helper function to parse time references
    const parseTimeReference = (text) => {
      const timePatterns = [
        { pattern: /(\d{1,2}):(\d{2})\s*(am|pm)/i, format: 'hh:mm am/pm' },
        { pattern: /(\d{1,2})\s*(am|pm)/i, format: 'hh am/pm' },
        { pattern: /(\d{1,2}):(\d{2})/i, format: '24h' }
      ];

      for (const { pattern } of timePatterns) {
        const match = text.match(pattern);
        if (match) {
          let hours = parseInt(match[1]);
          const minutes = match[2] ? parseInt(match[2]) : 0;
          const period = match[3]?.toLowerCase();

          if (period === 'pm' && hours !== 12) hours += 12;
          if (period === 'am' && hours === 12) hours = 0;

          return { hours, minutes };
        }
      }
      return null;
    };

    // Helper function to parse date references
    const parseDateReference = (text) => {
      const datePatterns = [
        { pattern: /tomorrow/i, offset: 1 },
        { pattern: /today/i, offset: 0 },
        { pattern: /next week/i, offset: 7 },
        { pattern: /monday/i, dayOfWeek: 1 },
        { pattern: /tuesday/i, dayOfWeek: 2 },
        { pattern: /wednesday/i, dayOfWeek: 3 },
        { pattern: /thursday/i, dayOfWeek: 4 },
        { pattern: /friday/i, dayOfWeek: 5 },
        { pattern: /saturday/i, dayOfWeek: 6 },
        { pattern: /sunday/i, dayOfWeek: 0 }
      ];

      for (const { pattern, offset, dayOfWeek } of datePatterns) {
        if (pattern.test(text)) {
          if (offset !== undefined) {
            return addDays(now, offset);
          }
          if (dayOfWeek !== undefined) {
            const currentDay = now.getDay();
            const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7;
            return addDays(now, daysUntilTarget || 7);
          }
        }
      }
      return now;
    };

    // Process task due dates
    if (result.type === 'task' && result.dueDate) {
      const baseDate = parseDateReference(lowerTranscription);
      const timeInfo = parseTimeReference(lowerTranscription);
      
      if (timeInfo) {
        result.dueDate = setMinutes(setHours(baseDate, timeInfo.hours), timeInfo.minutes).toISOString();
      } else {
        result.dueDate = setHours(baseDate, 17).toISOString(); // Default to 5 PM
      }

      // Set up reminder if time is specified
      if (timeInfo) {
        result.reminderSettings = {
          enabled: true,
          time: addMinutes(parseISO(result.dueDate), -15).toISOString() // 15 minutes before
        };
      }
    }

    // Process event times
    if (result.type === 'event') {
      const baseDate = parseDateReference(lowerTranscription);
      const timeInfo = parseTimeReference(lowerTranscription);
      
      if (timeInfo) {
        result.startTime = setMinutes(setHours(baseDate, timeInfo.hours), timeInfo.minutes).toISOString();
        
        // Default to 1-hour duration if no end time specified
        if (!result.endTime) {
          result.endTime = addHours(parseISO(result.startTime), 1).toISOString();
        }
      } else {
        result.startTime = setHours(baseDate, 14).toISOString(); // Default to 2 PM
        result.endTime = setHours(baseDate, 15).toISOString(); // Default to 3 PM
      }

      // Set up reminder for events
      result.reminderSettings = {
        enabled: true,
        time: addMinutes(parseISO(result.startTime), -15).toISOString() // 15 minutes before
      };
    }

    return result;
  };

  const processVoiceInput = async (audioBlob) => {
    setIsProcessing(true);
    
    try {
      let transcription;
      
      // Try real transcription first, fall back to mock if API key not available
      if (config.openai.apiKey && config.features.voiceProcessing) {
        try {
          transcription = await transcribeAudio(audioBlob);
          toast.success('Voice transcribed successfully');
        } catch (error) {
          console.warn('Real transcription failed, using mock:', error);
          transcription = generateMockTranscription();
          toast.info('Using demo mode - configure OpenAI API key for real transcription');
        }
      } else {
        transcription = generateMockTranscription();
        toast.info('Demo mode - configure OpenAI API key for real voice processing');
      }

      // Parse the transcription
      let result;
      if (config.openai.apiKey) {
        try {
          result = await parseTranscription(transcription);
        } catch (error) {
          console.warn('AI parsing failed, using fallback:', error);
          result = generateFallbackResult(transcription);
        }
      } else {
        result = generateFallbackResult(transcription);
      }

      return result;
    } catch (error) {
      console.error('Voice processing error:', error);
      toast.error('Failed to process voice input');
      
      // Return fallback result
      return {
        type: 'task',
        description: 'Voice input received (error occurred)',
        priority: 'medium',
        dueDate: null,
        reminderSettings: { enabled: false }
      };
    } finally {
      setIsProcessing(false);
    }
  };

  const generateMockTranscription = () => {
    const mockTranscriptions = [
      "Schedule a meeting with John tomorrow at 3 PM about the project review",
      "Remind me to buy groceries at 5 PM today",
      "Call mom tomorrow morning",
      "Team standup meeting on Friday at 10 AM",
      "Finish the quarterly report by end of week",
      "Doctor appointment next Tuesday at 2 PM",
      "Review budget proposal tomorrow afternoon",
      "Pick up dry cleaning after work today"
    ];
    
    return mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
  };

  const generateFallbackResult = (transcription) => {
    const lowerTranscription = transcription.toLowerCase();
    
    // Simple heuristics to determine if it's a task or event
    const isEvent = /meeting|appointment|call|lunch|dinner|conference/.test(lowerTranscription);
    const hasTime = /\d{1,2}:\d{2}|\d{1,2}\s*(am|pm)|morning|afternoon|evening/.test(lowerTranscription);
    const isHighPriority = /urgent|asap|important|critical/.test(lowerTranscription);
    const isMediumPriority = /soon|today|tomorrow/.test(lowerTranscription);
    
    if (isEvent) {
      return {
        type: 'event',
        title: transcription,
        startTime: addHours(new Date(), 1).toISOString(),
        endTime: addHours(new Date(), 2).toISOString(),
        location: null,
        attendees: [],
        reminderSettings: { enabled: hasTime, time: addMinutes(new Date(), 45).toISOString() }
      };
    } else {
      return {
        type: 'task',
        description: transcription,
        priority: isHighPriority ? 'high' : isMediumPriority ? 'medium' : 'low',
        dueDate: hasTime ? addHours(new Date(), 2).toISOString() : null,
        reminderSettings: { enabled: hasTime, time: addHours(new Date(), 1).toISOString() },
        tags: [],
        estimatedDuration: null
      };
    }
  };

  return { processVoiceInput, isProcessing };
}
