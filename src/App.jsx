import React, { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Toaster } from 'react-hot-toast';
import { AppShell } from './components/AppShell';
import { VoiceInputButton } from './components/VoiceInputButton';
import { TaskList } from './components/TaskList';
import { CalendarView } from './components/CalendarView';
import { PremiumModal } from './components/PremiumModal';
import { ReminderConfigurator } from './components/ReminderConfigurator';
import { NotificationSystem } from './components/NotificationSystem';
import { useVoiceProcessor } from './hooks/useVoiceProcessor';
import { usePaymentContext } from './hooks/usePaymentContext';
import { useAppStore } from './store';
import { config, validateConfig } from './config';
import { Calendar, CheckSquare, Settings, Mic, AlertTriangle } from 'lucide-react';

function App() {
  const { address, isConnected } = useAccount();
  const { processVoiceInput, isProcessing } = useVoiceProcessor();
  const { createSession } = usePaymentContext();
  
  // Global state from Zustand store
  const {
    user,
    isAuthenticated,
    tasks,
    events,
    activeView,
    showPremiumModal,
    isPremium,
    setActiveView,
    setShowPremiumModal,
    setIsPremium,
    createTask,
    updateTask,
    deleteTask,
    createEvent,
    updateEvent,
    deleteEvent,
    prioritizeTasks,
    initializeApp,
    cleanup
  } = useAppStore();

  // Local state for UI components
  const [showReminderConfig, setShowReminderConfig] = useState(false);
  const [reminderConfigData, setReminderConfigData] = useState(null);
  const [configValidation, setConfigValidation] = useState({ isValid: true, errors: [] });

  // Validate configuration on mount
  useEffect(() => {
    const validation = validateConfig();
    setConfigValidation(validation);
  }, []);

  // Initialize app when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      const mockUser = {
        id: address,
        wallet_address: address,
        farcaster_id: null,
        preferences: {}
      };
      initializeApp(mockUser);
    } else {
      cleanup();
    }
  }, [isConnected, address, initializeApp, cleanup]);

  const handleVoiceInput = async (audioBlob) => {
    try {
      const result = await processVoiceInput(audioBlob);
      
      if (result.type === 'task') {
        await createTask({
          description: result.description,
          status: 'pending',
          priority: result.priority || 'medium',
          due_date: result.dueDate,
          reminder_settings: result.reminderSettings,
          tags: result.tags || [],
          estimated_duration: result.estimatedDuration
        });
      } else if (result.type === 'event') {
        await createEvent({
          title: result.title,
          description: result.description,
          start_time: result.startTime,
          end_time: result.endTime,
          location: result.location,
          attendees: result.attendees || [],
          reminder_settings: result.reminderSettings
        });
      }
    } catch (error) {
      console.error('Voice processing error:', error);
    }
  };

  const handlePremiumFeature = async (feature) => {
    if (!isPremium) {
      setShowPremiumModal(true);
      return;
    }
    
    // Handle premium feature logic here
    console.log('Premium feature:', feature);
  };

  const handlePurchase = async () => {
    try {
      await createSession();
      setIsPremium(true);
      setShowPremiumModal(false);
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  const handleTaskUpdate = async (taskId, updates) => {
    try {
      await updateTask(taskId, updates);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleTaskDelete = async (taskId) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleReminderConfig = (item, type) => {
    setReminderConfigData({
      item,
      type,
      referenceTime: type === 'task' ? item.due_date : item.start_time
    });
    setShowReminderConfig(true);
  };

  const handleReminderUpdate = async (newSettings) => {
    if (!reminderConfigData) return;
    
    const { item, type } = reminderConfigData;
    const updates = { reminder_settings: newSettings };
    
    try {
      if (type === 'task') {
        await updateTask(item.task_id, updates);
      } else {
        await updateEvent(item.event_id, updates);
      }
    } catch (error) {
      console.error('Failed to update reminder:', error);
    }
  };

  return (
    <div className="cosmic-bg min-h-screen">
      <AppShell>
        {/* Configuration Warning */}
        {!configValidation.isValid && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Configuration Issues</h3>
                <ul className="mt-1 text-sm text-yellow-700 list-disc list-inside">
                  {configValidation.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-yellow-600">
                  Some features may not work properly. Please check your environment configuration.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-semibold text-white mb-2">{config.app.name}</h1>
            <p className="text-purple-200">{config.app.tagline}</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Notification System */}
            <NotificationSystem tasks={tasks} events={events} />
            
            {isPremium && (
              <span className="px-3 py-1 bg-accent text-white rounded-full text-sm">
                Premium
              </span>
            )}
            <ConnectButton />
          </div>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <p className="text-blue-800">
              Connect your wallet to start using SpeakTaskr and sync your data across devices.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveView('tasks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeView === 'tasks'
                ? 'bg-white text-purple-600 shadow-card'
                : 'text-white hover:bg-white/20'
            }`}
          >
            <CheckSquare size={18} />
            <span className="hidden sm:inline">Tasks</span>
          </button>
          <button
            onClick={() => setActiveView('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeView === 'calendar'
                ? 'bg-white text-purple-600 shadow-card'
                : 'text-white hover:bg-white/20'
            }`}
          >
            <Calendar size={18} />
            <span className="hidden sm:inline">Calendar</span>
          </button>
        </div>

        {/* Voice Input Button */}
        <div className="flex justify-center mb-8">
          <VoiceInputButton 
            onVoiceInput={handleVoiceInput}
            isProcessing={isProcessing}
          />
        </div>

        {/* Main Content */}
        <div className="glass-effect rounded-lg p-6">
          {activeView === 'tasks' && (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-xl font-semibold text-white">Your Tasks</h2>
                <button
                  onClick={prioritizeTasks}
                  className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/80 text-white rounded-lg transition-colors"
                >
                  <Settings size={18} />
                  AI Prioritize {!isPremium && '(Premium)'}
                </button>
              </div>
              <TaskList 
                tasks={tasks}
                onUpdateTask={handleTaskUpdate}
                onDeleteTask={handleTaskDelete}
                onConfigureReminder={(task) => handleReminderConfig(task, 'task')}
              />
            </>
          )}

          {activeView === 'calendar' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-6">Your Calendar</h2>
              <CalendarView 
                events={events} 
                onConfigureReminder={(event) => handleReminderConfig(event, 'event')}
              />
            </>
          )}
        </div>

        {/* Premium Modal */}
        {showPremiumModal && (
          <PremiumModal
            onClose={() => setShowPremiumModal(false)}
            onPurchase={handlePurchase}
          />
        )}

        {/* Reminder Configurator */}
        {showReminderConfig && reminderConfigData && (
          <ReminderConfigurator
            reminderSettings={reminderConfigData.item.reminder_settings}
            onUpdate={handleReminderUpdate}
            onClose={() => {
              setShowReminderConfig(false);
              setReminderConfigData(null);
            }}
            referenceTime={reminderConfigData.referenceTime}
            type={reminderConfigData.type}
          />
        )}
      </AppShell>
      
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}

export default App;
