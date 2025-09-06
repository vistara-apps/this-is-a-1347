import React from 'react';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';

export function CalendarView({ events }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-white/70">
        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No events scheduled. Use voice input to create your first event!</p>
      </div>
    );
  }

  const getDateLabel = (date) => {
    const eventDate = new Date(date);
    if (isToday(eventDate)) return 'Today';
    if (isTomorrow(eventDate)) return 'Tomorrow';
    if (isYesterday(eventDate)) return 'Yesterday';
    return format(eventDate, 'EEEE, MMM d');
  };

  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.startTime) - new Date(b.startTime)
  );

  return (
    <div className="space-y-4">
      {sortedEvents.map((event) => (
        <div
          key={event.id}
          className="p-4 bg-white/90 rounded-lg shadow-card hover:bg-white transition-all"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-800">{event.title}</h3>
            <span className="text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
              {getDateLabel(event.startTime)}
            </span>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>
                {format(new Date(event.startTime), 'h:mm a')}
                {event.endTime && ` - ${format(new Date(event.endTime), 'h:mm a')}`}
              </span>
            </div>
            
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{event.location}</span>
              </div>
            )}
            
            {event.attendees && event.attendees.length > 0 && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{event.attendees.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}