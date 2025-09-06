// Application configuration
export const config = {
  // OpenAI Configuration
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    baseURL: import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1',
    model: 'gpt-4-turbo-preview',
    whisperModel: 'whisper-1'
  },

  // Supabase Configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  },

  // Farcaster/Neynar Configuration
  neynar: {
    apiKey: import.meta.env.VITE_NEYNAR_API_KEY || '',
    baseURL: import.meta.env.VITE_NEYNAR_BASE_URL || 'https://api.neynar.com/v2'
  },

  // Payment Configuration
  payment: {
    baseURL: import.meta.env.VITE_PAYMENT_BASE_URL || 'https://payments.vistara.dev',
    premiumFeaturePrice: 0.001 // in USD
  },

  // App Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'SpeakTaskr',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    tagline: 'Your Voice, Your Tasks, Seamlessly Organized'
  },

  // Feature Flags
  features: {
    realTimeSync: true,
    voiceProcessing: true,
    premiumFeatures: true,
    notifications: true,
    farcasterIntegration: false // Disabled until API keys are configured
  },

  // AI Configuration
  ai: {
    maxTokens: 1000,
    temperature: 0.1,
    systemPrompts: {
      taskParser: `You are a task and calendar event parser. Analyze the user's spoken input and determine if it's a task or calendar event. 

For tasks, respond with JSON:
{
  "type": "task",
  "description": "the main task",
  "priority": "high|medium|low",
  "dueDate": "ISO date string if mentioned",
  "reminderSettings": { "enabled": boolean, "time": "ISO date string" },
  "tags": ["array", "of", "tags"],
  "estimatedDuration": "duration in minutes if mentioned"
}

For calendar events, respond with JSON:
{
  "type": "event",
  "title": "event title",
  "startTime": "ISO date string",
  "endTime": "ISO date string if mentioned",
  "location": "location if mentioned",
  "attendees": ["list of people"],
  "reminderSettings": { "enabled": boolean, "time": "ISO date string" },
  "description": "additional details"
}

Only respond with valid JSON, no other text.`,
      
      prioritizer: `You are an AI task prioritization expert. Analyze the given tasks and reorder them based on:
1. Urgency (due dates, time-sensitive nature)
2. Importance (impact on goals, consequences of delay)
3. Dependencies (tasks that block others)
4. Effort required (quick wins vs. complex tasks)

Return the tasks in optimal order with reasoning for each priority level.`,

      sequencer: `You are an AI task sequencing expert. Analyze the given tasks and suggest an optimal workflow sequence considering:
1. Task dependencies
2. Resource requirements
3. Energy levels throughout the day
4. Context switching costs
5. Deadline constraints

Provide a structured sequence with time estimates and reasoning.`
    }
  }
};

// Validation function to check if required config is present
export const validateConfig = () => {
  const errors = [];
  
  if (!config.openai.apiKey && config.features.voiceProcessing) {
    errors.push('OpenAI API key is required for voice processing');
  }
  
  if (!config.supabase.url || !config.supabase.anonKey) {
    errors.push('Supabase configuration is required for data persistence');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
