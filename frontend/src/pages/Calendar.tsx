import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar as BigCalendar, dateFnsLocalizer, Event } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMonths, startOfMonth, endOfMonth } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { postsApi } from '../services/api';
import { Post } from '../types';
import { parseJSON, getStatusColor } from '../utils/helpers';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent extends Event {
  post: Post;
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: posts } = useQuery({
    queryKey: ['posts', 'calendar', currentDate],
    queryFn: async () => {
      const start = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const end = format(endOfMonth(addMonths(currentDate, 1)), 'yyyy-MM-dd');
      const res = await postsApi.getByDateRange(start, end);
      return res.data.data || [];
    },
  });

  const events: CalendarEvent[] = (posts || []).map((post) => {
    const date = post.scheduled_at || post.published_at || post.created_at;
    return {
      title: post.title,
      start: new Date(date),
      end: new Date(date),
      post,
    };
  });

  const eventStyleGetter = (event: CalendarEvent) => {
    const platforms = parseJSON<string[]>(event.post.platforms, []);
    const style: React.CSSProperties = {
      backgroundColor: '#3b82f6',
      borderRadius: '4px',
      opacity: 0.9,
      color: 'white',
      border: '0px',
      display: 'block',
    };

    if (event.post.status === 'published') {
      style.backgroundColor = '#10b981';
    } else if (event.post.status === 'failed') {
      style.backgroundColor = '#ef4444';
    } else if (event.post.status === 'scheduled') {
      style.backgroundColor = '#f59e0b';
    }

    return { style };
  };

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Calendar</h1>
        <p className="text-gray-600">View and manage your scheduled posts</p>
      </div>

      {/* Calendar */}
      <div className="card" style={{ height: '700px' }}>
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={(event) => setSelectedEvent(event)}
          onNavigate={(date) => setCurrentDate(date)}
        />
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">{selectedEvent.post.title}</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className={`badge ${getStatusColor(selectedEvent.post.status)} text-white`}>
                  {selectedEvent.post.status}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Content</h4>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedEvent.post.content}</p>
              </div>

              {selectedEvent.post.media_urls && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Media</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {parseJSON<string[]>(selectedEvent.post.media_urls, []).map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Media ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Platforms</h4>
                <div className="flex gap-2">
                  {parseJSON<string[]>(selectedEvent.post.platforms, []).map((platform) => (
                    <span key={platform} className="badge bg-primary-100 text-primary-700 capitalize">
                      {platform}
                    </span>
                  ))}
                </div>
              </div>

              {selectedEvent.post.scheduled_at && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Scheduled for</h4>
                  <p className="text-gray-900">{format(new Date(selectedEvent.post.scheduled_at), 'PPpp')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span className="text-sm text-gray-700">Draft</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-sm text-gray-700">Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-700">Published</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-700">Failed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
