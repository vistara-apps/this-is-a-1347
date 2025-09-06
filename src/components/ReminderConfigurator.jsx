import React, { useState } from 'react';
import { Bell, BellOff, Clock, Calendar, X } from 'lucide-react';
import { format, addMinutes, addHours, addDays } from 'date-fns';

export function ReminderConfigurator({ 
  reminderSettings = { enabled: false, time: null }, 
  onUpdate, 
  onClose,
  referenceTime, // The time of the task/event
  type = 'task' // 'task' or 'event'
}) {
  const [enabled, setEnabled] = useState(reminderSettings.enabled);
  const [reminderTime, setReminderTime] = useState(
    reminderSettings.time || (referenceTime ? addMinutes(new Date(referenceTime), -15).toISOString() : null)
  );
  const [customTime, setCustomTime] = useState('');

  const presetOptions = [
    { label: '5 minutes before', value: -5, unit: 'minutes' },
    { label: '15 minutes before', value: -15, unit: 'minutes' },
    { label: '30 minutes before', value: -30, unit: 'minutes' },
    { label: '1 hour before', value: -1, unit: 'hours' },
    { label: '2 hours before', value: -2, unit: 'hours' },
    { label: '1 day before', value: -1, unit: 'days' },
  ];

  const handlePresetSelect = (preset) => {
    if (!referenceTime) return;
    
    const baseTime = new Date(referenceTime);
    let newReminderTime;
    
    switch (preset.unit) {
      case 'minutes':
        newReminderTime = addMinutes(baseTime, preset.value);
        break;
      case 'hours':
        newReminderTime = addHours(baseTime, preset.value);
        break;
      case 'days':
        newReminderTime = addDays(baseTime, preset.value);
        break;
      default:
        newReminderTime = baseTime;
    }
    
    setReminderTime(newReminderTime.toISOString());
  };

  const handleCustomTimeChange = (e) => {
    const time = e.target.value;
    setCustomTime(time);
    
    if (time && referenceTime) {
      const [hours, minutes] = time.split(':').map(Number);
      const baseDate = new Date(referenceTime);
      const customDateTime = new Date(baseDate);
      customDateTime.setHours(hours, minutes, 0, 0);
      
      // If the custom time is after the reference time, set it for the day before
      if (customDateTime >= baseDate) {
        customDateTime.setDate(customDateTime.getDate() - 1);
      }
      
      setReminderTime(customDateTime.toISOString());
    }
  };

  const handleSave = () => {
    const newSettings = {
      enabled,
      time: enabled ? reminderTime : null
    };
    
    onUpdate(newSettings);
    onClose();
  };

  const formatReminderTime = (time) => {
    if (!time) return '';
    return format(new Date(time), 'MMM d, yyyy \'at\' h:mm a');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-6 h-6 text-purple-500" />
            <h2 className="text-xl font-semibold text-gray-800">
              Configure Reminder
            </h2>
          </div>
          <p className="text-gray-600 text-sm">
            Set up when you'd like to be reminded about this {type}
          </p>
        </div>

        {/* Enable/Disable Toggle */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="sr-only"
            />
            <div className={`relative w-12 h-6 rounded-full transition-colors ${
              enabled ? 'bg-purple-500' : 'bg-gray-300'
            }`}>
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                enabled ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </div>
            <span className="text-gray-700">
              {enabled ? 'Reminder enabled' : 'Reminder disabled'}
            </span>
            {enabled ? (
              <Bell className="w-4 h-4 text-purple-500" />
            ) : (
              <BellOff className="w-4 h-4 text-gray-400" />
            )}
          </label>
        </div>

        {enabled && (
          <>
            {/* Reference Time Display */}
            {referenceTime && (
              <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-purple-700">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {type === 'task' ? 'Task due:' : 'Event starts:'} {formatReminderTime(referenceTime)}
                  </span>
                </div>
              </div>
            )}

            {/* Preset Options */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Options</h3>
              <div className="grid grid-cols-2 gap-2">
                {presetOptions.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handlePresetSelect(preset)}
                    className="p-2 text-sm border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-200 transition-colors text-left"
                    disabled={!referenceTime}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Time Input */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Custom Time</h3>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <input
                  type="time"
                  value={customTime}
                  onChange={handleCustomTimeChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={!referenceTime}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Set a specific time for the reminder
              </p>
            </div>

            {/* Current Reminder Time Display */}
            {reminderTime && (
              <div className="mb-6 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <Bell className="w-4 h-4" />
                  <span>
                    Reminder set for: {formatReminderTime(reminderTime)}
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Save Reminder
          </button>
        </div>
      </div>
    </div>
  );
}
