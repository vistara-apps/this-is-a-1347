import React, { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { AppShell } from './components/AppShell';
import { VoiceInputButton } from './components/VoiceInputButton';
import { TaskList } from './components/TaskList';
import { CalendarView } from './components/CalendarView';
import { PremiumModal } from './components/PremiumModal';
import { useVoiceProcessor } from './hooks/useVoiceProcessor';
import { usePaymentContext } from './hooks/usePaymentContext';
import { Calendar, CheckSquare, Settings, Mic } from 'lucide-react';

function App() {
  const [activeView, setActiveView] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  const { processVoiceInput, isProcessing } = useVoiceProcessor();
  const { createSession } = usePaymentContext();

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('speaktaskr-tasks');
    const savedEvents = localStorage.getItem('speaktaskr-events');
    
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedEvents) setEvents(JSON.parse(savedEvents));
  }, []);

  // Save data to localStorage when tasks or events change
  useEffect(() => {
    localStorage.setItem('speaktaskr-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('speaktaskr-events', JSON.stringify(events));
  }, [events]);

  const handleVoiceInput = async (audioBlob) => {
    try {
      const result = await processVoiceInput(audioBlob);
      
      if (result.type === 'task') {
        const newTask = {
          id: Date.now(),
          description: result.description,
          status: 'pending',
          priority: result.priority || 'medium',
          dueDate: result.dueDate,
          reminderSettings: result.reminderSettings,
          createdAt: new Date().toISOString()
        };
        setTasks(prev => [...prev, newTask]);
      } else if (result.type === 'event') {
        const newEvent = {
          id: Date.now(),
          title: result.title,
          startTime: result.startTime,
          endTime: result.endTime,
          location: result.location,
          attendees: result.attendees || [],
          reminderSettings: result.reminderSettings,
          createdAt: new Date().toISOString()
        };
        setEvents(prev => [...prev, newEvent]);
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

  const updateTask = (taskId, updates) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const prioritizeTasks = () => {
    handlePremiumFeature('prioritization');
    if (isPremium) {
      // AI-powered task prioritization logic
      const prioritizedTasks = [...tasks].sort((a, b) => {
        const priorities = { high: 3, medium: 2, low: 1 };
        return priorities[b.priority] - priorities[a.priority];
      });
      setTasks(prioritizedTasks);
    }
  };

  return (
    <div className="cosmic-bg min-h-screen">
      <AppShell>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-semibold text-white mb-2">SpeakTaskr</h1>
            <p className="text-purple-200">Your Voice, Your Tasks, Seamlessly Organized</p>
          </div>
          <div className="flex items-center gap-4">
            {isPremium && (
              <span className="px-3 py-1 bg-accent text-white rounded-full text-sm">
                Premium
              </span>
            )}
            <ConnectButton />
          </div>
        </div>

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
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
              />
            </>
          )}

          {activeView === 'calendar' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-6">Your Calendar</h2>
              <CalendarView events={events} />
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
      </AppShell>
    </div>
  );
}

export default App;