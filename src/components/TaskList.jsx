import React from 'react';
import { CheckCircle2, Circle, Clock, Trash2, AlertCircle, Bell, BellOff, Tag, Timer } from 'lucide-react';
import { format, isAfter, isBefore, addHours } from 'date-fns';

export function TaskList({ tasks, onUpdateTask, onDeleteTask, onConfigureReminder }) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-white/70">
        <Circle className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No tasks yet. Use voice input to create your first task!</p>
      </div>
    );
  }

  const toggleTask = (taskId) => {
    const task = tasks.find(t => t.task_id === taskId);
    onUpdateTask(taskId, {
      status: task.status === 'completed' ? 'pending' : 'completed'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-400 bg-red-50';
      case 'medium': return 'border-yellow-400 bg-yellow-50';
      case 'low': return 'border-green-400 bg-green-50';
      default: return 'border-gray-400 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'low': return <Circle className="w-4 h-4 text-green-500" />;
      default: return null;
    }
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;
    return format(new Date(dueDate), 'MMM d, h:mm a');
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const isDueSoon = (dueDate) => {
    if (!dueDate) return false;
    const now = new Date();
    const due = new Date(dueDate);
    return isAfter(due, now) && isBefore(due, addHours(now, 24));
  };

  const formatEstimatedDuration = (minutes) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const overdue = isOverdue(task.due_date);
        const dueSoon = isDueSoon(task.due_date);
        
        return (
          <div
            key={task.task_id}
            className={`p-4 rounded-lg border-l-4 ${getPriorityColor(task.priority)} bg-white/90 transition-all hover:bg-white ${
              overdue ? 'ring-2 ring-red-200' : dueSoon ? 'ring-2 ring-yellow-200' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => toggleTask(task.task_id)}
                className="mt-1 transition-colors"
              >
                {task.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400 hover:text-green-500" />
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <p className={`text-gray-800 ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                  {task.description}
                </p>
                
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {/* Priority */}
                  <div className="flex items-center gap-1">
                    {getPriorityIcon(task.priority)}
                    <span className="text-xs text-gray-600 capitalize">{task.priority}</span>
                  </div>
                  
                  {/* Due Date */}
                  {task.due_date && (
                    <div className={`flex items-center gap-1 ${
                      overdue ? 'text-red-600' : dueSoon ? 'text-yellow-600' : 'text-gray-600'
                    }`}>
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">
                        {formatDueDate(task.due_date)}
                        {overdue && ' (Overdue)'}
                        {dueSoon && !overdue && ' (Due Soon)'}
                      </span>
                    </div>
                  )}
                  
                  {/* Estimated Duration */}
                  {task.estimated_duration && (
                    <div className="flex items-center gap-1">
                      <Timer className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-600">
                        {formatEstimatedDuration(task.estimated_duration)}
                      </span>
                    </div>
                  )}
                  
                  {/* Tags */}
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-gray-500" />
                      <div className="flex gap-1">
                        {task.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {task.tags.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{task.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Reminder Status */}
                  {task.reminder_settings && (
                    <div className="flex items-center gap-1">
                      {task.reminder_settings.enabled ? (
                        <Bell className="w-3 h-3 text-purple-500" />
                      ) : (
                        <BellOff className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {/* Configure Reminder Button */}
                {onConfigureReminder && (
                  <button
                    onClick={() => onConfigureReminder(task)}
                    className="p-1 text-gray-400 hover:text-purple-500 transition-colors"
                    title="Configure reminder"
                  >
                    {task.reminder_settings?.enabled ? (
                      <Bell className="w-4 h-4" />
                    ) : (
                      <BellOff className="w-4 h-4" />
                    )}
                  </button>
                )}
                
                {/* Delete Button */}
                <button
                  onClick={() => onDeleteTask(task.task_id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
