import React, { useEffect, useState } from 'react';
import { Bell, X, Clock, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { format, isAfter, isBefore, addMinutes } from 'date-fns';
import { useNotificationStore } from '../store';
import toast from 'react-hot-toast';

export function NotificationSystem({ tasks = [], events = [] }) {
  const { notifications, addNotification, markAsRead, removeNotification } = useNotificationStore();
  const [showNotifications, setShowNotifications] = useState(false);

  // Check for due reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const checkWindow = addMinutes(now, 1); // Check for reminders in the next minute

      // Check task reminders
      tasks.forEach(task => {
        if (task.reminder_settings?.enabled && task.reminder_settings?.time) {
          const reminderTime = new Date(task.reminder_settings.time);
          
          if (isAfter(reminderTime, now) && isBefore(reminderTime, checkWindow)) {
            const notificationId = addNotification({
              type: 'task_reminder',
              title: 'Task Reminder',
              message: task.description,
              taskId: task.task_id,
              priority: task.priority,
              dueDate: task.due_date
            });

            // Show browser notification if permission granted
            if (Notification.permission === 'granted') {
              new Notification('SpeakTaskr - Task Reminder', {
                body: task.description,
                icon: '/favicon.ico',
                tag: `task-${task.task_id}`
              });
            }

            // Show toast notification
            toast.custom((t) => (
              <div className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                <div className="flex-1 w-0 p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Clock className="h-6 w-6 text-purple-500" />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Task Reminder
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {task.description}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex border-l border-gray-200">
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            ), { duration: 10000 });
          }
        }
      });

      // Check event reminders
      events.forEach(event => {
        if (event.reminder_settings?.enabled && event.reminder_settings?.time) {
          const reminderTime = new Date(event.reminder_settings.time);
          
          if (isAfter(reminderTime, now) && isBefore(reminderTime, checkWindow)) {
            const notificationId = addNotification({
              type: 'event_reminder',
              title: 'Event Reminder',
              message: event.title,
              eventId: event.event_id,
              startTime: event.start_time,
              location: event.location
            });

            // Show browser notification if permission granted
            if (Notification.permission === 'granted') {
              new Notification('SpeakTaskr - Event Reminder', {
                body: `${event.title}${event.location ? ` at ${event.location}` : ''}`,
                icon: '/favicon.ico',
                tag: `event-${event.event_id}`
              });
            }

            // Show toast notification
            toast.custom((t) => (
              <div className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                <div className="flex-1 w-0 p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Calendar className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Event Reminder
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {event.title}
                      </p>
                      {event.location && (
                        <p className="mt-1 text-xs text-gray-400">
                          📍 {event.location}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex border-l border-gray-200">
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            ), { duration: 10000 });
          }
        }
      });
    };

    // Check reminders every 30 seconds
    const interval = setInterval(checkReminders, 30000);
    
    // Initial check
    checkReminders();

    return () => clearInterval(interval);
  }, [tasks, events, addNotification]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_reminder':
        return <Clock className="w-5 h-5 text-purple-500" />;
      case 'event_reminder':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatNotificationTime = (timestamp) => {
    return format(new Date(timestamp), 'h:mm a');
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {formatNotificationTime(notification.timestamp)}
                            </span>
                            <button
                              onClick={() => removeNotification(notification.id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        
                        {/* Additional info based on notification type */}
                        {notification.type === 'task_reminder' && notification.dueDate && (
                          <p className="text-xs text-gray-500 mt-1">
                            Due: {format(new Date(notification.dueDate), 'MMM d, h:mm a')}
                          </p>
                        )}
                        
                        {notification.type === 'event_reminder' && notification.startTime && (
                          <p className="text-xs text-gray-500 mt-1">
                            Starts: {format(new Date(notification.startTime), 'MMM d, h:mm a')}
                          </p>
                        )}
                        
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-blue-600 hover:text-blue-800 mt-2"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  notifications.forEach(n => markAsRead(n.id));
                }}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
