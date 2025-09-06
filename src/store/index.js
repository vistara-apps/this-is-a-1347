import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { DatabaseService } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

// Main application store
export const useAppStore = create(
  subscribeWithSelector((set, get) => ({
    // User state
    user: null,
    isAuthenticated: false,
    userPreferences: null,

    // Tasks state
    tasks: [],
    tasksLoading: false,
    tasksError: null,

    // Events state
    events: [],
    eventsLoading: false,
    eventsError: null,

    // UI state
    activeView: 'tasks',
    showPremiumModal: false,
    isPremium: false,
    isProcessing: false,

    // Real-time subscriptions
    subscriptions: [],

    // Actions
    setUser: (user) => set({ user, isAuthenticated: !!user }),
    
    setActiveView: (view) => set({ activeView: view }),
    
    setShowPremiumModal: (show) => set({ showPremiumModal: show }),
    
    setIsPremium: (isPremium) => set({ isPremium }),
    
    setIsProcessing: (isProcessing) => set({ isProcessing }),

    // User preferences actions
    loadUserPreferences: async () => {
      const { user } = get();
      if (!user) return;

      try {
        const preferences = await DatabaseService.getUserPreferences(user.id);
        set({ userPreferences: preferences });
      } catch (error) {
        console.error('Failed to load user preferences:', error);
      }
    },

    updateUserPreferences: async (updates) => {
      const { user } = get();
      if (!user) return;

      try {
        const preferences = await DatabaseService.updateUserPreferences(user.id, updates);
        set({ userPreferences: preferences });
        toast.success('Preferences updated');
      } catch (error) {
        console.error('Failed to update user preferences:', error);
        toast.error('Failed to update preferences');
      }
    },

    // Task actions
    loadTasks: async () => {
      const { user } = get();
      if (!user) return;

      set({ tasksLoading: true, tasksError: null });
      
      try {
        const tasks = await DatabaseService.getTasks(user.id);
        set({ tasks, tasksLoading: false });
      } catch (error) {
        console.error('Failed to load tasks:', error);
        set({ tasksError: error.message, tasksLoading: false });
        toast.error('Failed to load tasks');
      }
    },

    createTask: async (taskData) => {
      const { user } = get();
      if (!user) return;

      try {
        const newTask = await DatabaseService.createTask({
          ...taskData,
          user_id: user.id,
          task_id: uuidv4()
        });
        
        set((state) => ({
          tasks: [newTask, ...state.tasks]
        }));
        
        toast.success('Task created');
        return newTask;
      } catch (error) {
        console.error('Failed to create task:', error);
        toast.error('Failed to create task');
        throw error;
      }
    },

    updateTask: async (taskId, updates) => {
      try {
        const updatedTask = await DatabaseService.updateTask(taskId, updates);
        
        set((state) => ({
          tasks: state.tasks.map(task => 
            task.task_id === taskId ? updatedTask : task
          )
        }));
        
        return updatedTask;
      } catch (error) {
        console.error('Failed to update task:', error);
        toast.error('Failed to update task');
        throw error;
      }
    },

    deleteTask: async (taskId) => {
      try {
        await DatabaseService.deleteTask(taskId);
        
        set((state) => ({
          tasks: state.tasks.filter(task => task.task_id !== taskId)
        }));
        
        toast.success('Task deleted');
      } catch (error) {
        console.error('Failed to delete task:', error);
        toast.error('Failed to delete task');
        throw error;
      }
    },

    prioritizeTasks: async () => {
      const { tasks, isPremium } = get();
      
      if (!isPremium) {
        set({ showPremiumModal: true });
        return;
      }

      try {
        // AI-powered task prioritization logic
        const prioritizedTasks = [...tasks].sort((a, b) => {
          const priorities = { high: 3, medium: 2, low: 1 };
          const priorityScore = priorities[b.priority] - priorities[a.priority];
          
          // Consider due dates
          if (a.due_date && b.due_date) {
            const dateScore = new Date(a.due_date) - new Date(b.due_date);
            return priorityScore || dateScore;
          }
          
          if (a.due_date && !b.due_date) return -1;
          if (!a.due_date && b.due_date) return 1;
          
          return priorityScore;
        });
        
        set({ tasks: prioritizedTasks });
        toast.success('Tasks prioritized');
      } catch (error) {
        console.error('Failed to prioritize tasks:', error);
        toast.error('Failed to prioritize tasks');
      }
    },

    // Event actions
    loadEvents: async () => {
      const { user } = get();
      if (!user) return;

      set({ eventsLoading: true, eventsError: null });
      
      try {
        const events = await DatabaseService.getEvents(user.id);
        set({ events, eventsLoading: false });
      } catch (error) {
        console.error('Failed to load events:', error);
        set({ eventsError: error.message, eventsLoading: false });
        toast.error('Failed to load events');
      }
    },

    createEvent: async (eventData) => {
      const { user } = get();
      if (!user) return;

      try {
        const newEvent = await DatabaseService.createEvent({
          ...eventData,
          user_id: user.id,
          event_id: uuidv4()
        });
        
        set((state) => ({
          events: [...state.events, newEvent].sort(
            (a, b) => new Date(a.start_time) - new Date(b.start_time)
          )
        }));
        
        toast.success('Event created');
        return newEvent;
      } catch (error) {
        console.error('Failed to create event:', error);
        toast.error('Failed to create event');
        throw error;
      }
    },

    updateEvent: async (eventId, updates) => {
      try {
        const updatedEvent = await DatabaseService.updateEvent(eventId, updates);
        
        set((state) => ({
          events: state.events.map(event => 
            event.event_id === eventId ? updatedEvent : event
          ).sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
        }));
        
        return updatedEvent;
      } catch (error) {
        console.error('Failed to update event:', error);
        toast.error('Failed to update event');
        throw error;
      }
    },

    deleteEvent: async (eventId) => {
      try {
        await DatabaseService.deleteEvent(eventId);
        
        set((state) => ({
          events: state.events.filter(event => event.event_id !== eventId)
        }));
        
        toast.success('Event deleted');
      } catch (error) {
        console.error('Failed to delete event:', error);
        toast.error('Failed to delete event');
        throw error;
      }
    },

    // Real-time subscriptions
    setupRealtimeSubscriptions: () => {
      const { user, subscriptions } = get();
      if (!user || subscriptions.length > 0) return;

      const taskSubscription = DatabaseService.subscribeToTasks(user.id, (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;
        
        set((state) => {
          let newTasks = [...state.tasks];
          
          switch (eventType) {
            case 'INSERT':
              newTasks = [newRecord, ...newTasks];
              break;
            case 'UPDATE':
              newTasks = newTasks.map(task => 
                task.task_id === newRecord.task_id ? newRecord : task
              );
              break;
            case 'DELETE':
              newTasks = newTasks.filter(task => task.task_id !== oldRecord.task_id);
              break;
          }
          
          return { tasks: newTasks };
        });
      });

      const eventSubscription = DatabaseService.subscribeToEvents(user.id, (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;
        
        set((state) => {
          let newEvents = [...state.events];
          
          switch (eventType) {
            case 'INSERT':
              newEvents = [...newEvents, newRecord].sort(
                (a, b) => new Date(a.start_time) - new Date(b.start_time)
              );
              break;
            case 'UPDATE':
              newEvents = newEvents.map(event => 
                event.event_id === newRecord.event_id ? newRecord : event
              ).sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
              break;
            case 'DELETE':
              newEvents = newEvents.filter(event => event.event_id !== oldRecord.event_id);
              break;
          }
          
          return { events: newEvents };
        });
      });

      set({ subscriptions: [taskSubscription, eventSubscription] });
    },

    cleanupSubscriptions: () => {
      const { subscriptions } = get();
      subscriptions.forEach(subscription => subscription.unsubscribe());
      set({ subscriptions: [] });
    },

    // Initialize app data
    initializeApp: async (user) => {
      set({ user, isAuthenticated: !!user });
      
      if (user) {
        const { loadTasks, loadEvents, loadUserPreferences, setupRealtimeSubscriptions } = get();
        
        // Load user data
        await Promise.all([
          loadTasks(),
          loadEvents(),
          loadUserPreferences()
        ]);
        
        // Setup real-time subscriptions
        setupRealtimeSubscriptions();
      }
    },

    // Cleanup on logout
    cleanup: () => {
      const { cleanupSubscriptions } = get();
      cleanupSubscriptions();
      
      set({
        user: null,
        isAuthenticated: false,
        userPreferences: null,
        tasks: [],
        events: [],
        activeView: 'tasks',
        showPremiumModal: false,
        isPremium: false,
        isProcessing: false
      });
    }
  }))
);

// Notification store for managing reminders and alerts
export const useNotificationStore = create((set, get) => ({
  notifications: [],
  
  addNotification: (notification) => {
    const id = uuidv4();
    const newNotification = {
      id,
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    
    set((state) => ({
      notifications: [newNotification, ...state.notifications]
    }));
    
    return id;
  },
  
  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    }));
  },
  
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(notification => notification.id !== id)
    }));
  },
  
  clearAll: () => set({ notifications: [] })
}));
