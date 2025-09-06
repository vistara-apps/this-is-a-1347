import React from 'react';
import { CheckCircle2, Circle, Clock, Trash2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export function TaskList({ tasks, onUpdateTask, onDeleteTask }) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-white/70">
        <Circle className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No tasks yet. Use voice input to create your first task!</p>
      </div>
    );
  }

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

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`p-4 rounded-lg border-l-4 ${getPriorityColor(task.priority)} bg-white/90 transition-all hover:bg-white`}
        >
          <div className="flex items-start gap-3">
            <button
              onClick={() => onUpdateTask(task.id, { 
                status: task.status === 'completed' ? 'pending' : 'completed' 
              })}
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
                <div className="flex items-center gap-1">
                  {getPriorityIcon(task.priority)}
                  <span className="text-xs text-gray-600 capitalize">{task.priority}</span>
                </div>
                
                {task.dueDate && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-500" />
                    <span className="text-xs text-gray-600">
                      {format(new Date(task.dueDate), 'MMM d, h:mm a')}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={() => onDeleteTask(task.id)}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}