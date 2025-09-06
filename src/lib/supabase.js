import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

// Create Supabase client
export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

// Database schema types
export const TABLES = {
  USERS: 'users',
  TASKS: 'tasks',
  CALENDAR_EVENTS: 'calendar_events',
  USER_PREFERENCES: 'user_preferences'
};

// Database operations
export class DatabaseService {
  // User operations
  static async createUser(userData) {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .insert([userData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getUser(userId) {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async updateUser(userId, updates) {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Task operations
  static async createTask(taskData) {
    const { data, error } = await supabase
      .from(TABLES.TASKS)
      .insert([taskData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getTasks(userId) {
    const { data, error } = await supabase
      .from(TABLES.TASKS)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async updateTask(taskId, updates) {
    const { data, error } = await supabase
      .from(TABLES.TASKS)
      .update(updates)
      .eq('task_id', taskId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteTask(taskId) {
    const { error } = await supabase
      .from(TABLES.TASKS)
      .delete()
      .eq('task_id', taskId);
    
    if (error) throw error;
  }

  // Calendar event operations
  static async createEvent(eventData) {
    const { data, error } = await supabase
      .from(TABLES.CALENDAR_EVENTS)
      .insert([eventData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getEvents(userId) {
    const { data, error } = await supabase
      .from(TABLES.CALENDAR_EVENTS)
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  static async updateEvent(eventId, updates) {
    const { data, error } = await supabase
      .from(TABLES.CALENDAR_EVENTS)
      .update(updates)
      .eq('event_id', eventId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteEvent(eventId) {
    const { error } = await supabase
      .from(TABLES.CALENDAR_EVENTS)
      .delete()
      .eq('event_id', eventId);
    
    if (error) throw error;
  }

  // User preferences operations
  static async getUserPreferences(userId) {
    const { data, error } = await supabase
      .from(TABLES.USER_PREFERENCES)
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async updateUserPreferences(userId, preferences) {
    const { data, error } = await supabase
      .from(TABLES.USER_PREFERENCES)
      .upsert([{ user_id: userId, ...preferences }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Real-time subscriptions
  static subscribeToTasks(userId, callback) {
    return supabase
      .channel(`tasks:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLES.TASKS,
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }

  static subscribeToEvents(userId, callback) {
    return supabase
      .channel(`events:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLES.CALENDAR_EVENTS,
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }
}

// SQL schema for database setup (to be run in Supabase SQL editor)
export const DATABASE_SCHEMA = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farcaster_id TEXT UNIQUE,
  wallet_address TEXT UNIQUE,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  task_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date TIMESTAMP WITH TIME ZONE,
  reminder_settings JSONB DEFAULT '{"enabled": false}',
  tags TEXT[] DEFAULT '{}',
  estimated_duration INTEGER, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calendar events table
CREATE TABLE IF NOT EXISTS calendar_events (
  event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  location TEXT,
  attendees TEXT[] DEFAULT '{}',
  reminder_settings JSONB DEFAULT '{"enabled": false}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  notification_settings JSONB DEFAULT '{"enabled": true, "sound": true}',
  ai_settings JSONB DEFAULT '{"auto_prioritize": false, "smart_reminders": true}',
  theme_settings JSONB DEFAULT '{"theme": "default"}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own tasks" ON tasks FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own tasks" ON tasks FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own events" ON calendar_events FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own events" ON calendar_events FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own events" ON calendar_events FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own events" ON calendar_events FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own preferences" ON user_preferences FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can upsert own preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own preferences" ON user_preferences FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;
