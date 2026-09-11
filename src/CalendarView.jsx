import { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAuth } from './AuthContext';

const locales = { 'en-US' : enUS };
const localizer = dateFnsLocalizer ({
    format,
    parse,
    startOfWeek,
    getDay,
    locales
});

function CalendarView() {
  const { token, currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    is_public: false
  });

  const [currentView, setCurrentView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchEvents();
  }, []);

  function fetchEvents() {
    fetch(`${import.meta.env.VITE_API_URL}/events`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setEvents(data))
      .catch((error) => console.error('Error fetching events:', error));
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    fetch(`${import.meta.env.VITE_API_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    })
      .then((response) => response.json())
      .then(() => {
        setFormData({ title: '', description: '', event_date: '', is_public: false });
        setShowAddEventForm (false);
        fetchEvents();
      })
      .catch((error) => console.error('Error creating event:', error));
  }

  function handleDelete(eventId) {
    fetch(`${import.meta.env.VITE_API_URL}/events/${eventId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchEvents())
      .catch((error) => console.error('Error deleting event:', error));
  }

  // Called when a user clicks/drags a blank slot on the calendar
  const handleSelectSlot = useCallback((slotInfo) => {
    const localDate = new Date(slotInfo.start.getTime() - slotInfo.start.getTimezoneOffset() * 60000);
    const formatted = localDate.toISOString().slice(0, 16);
    setFormData((prev) => ({ ...prev, event_date: formatted }));
    setShowAddEventForm(true);
  }, []);

  // Called when a user clicks an existing event
  function handleSelectEvent(event) {
    if (window.confirm(`Delete "${event.title}"?`)) {
      handleDelete(event.id);
    }
  }

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const calendarEvents = events.map((event) => ({
    id: event.id,
    title: event.is_public ? `${event.title} (Team-wide)` : event.title,
    start: new Date(event.event_date),
    end: new Date(event.event_date)
  }));

  return (
    <div className="page-content">
      <header className="app-header">
        <h1>Calendar</h1>
        <p className="subtitle">Your events and team-wide events</p>
      </header>

      <div className="add-card">
        <button className="btn-primary" onClick={() => setShowAddEventForm((prev) => !prev)}>
          {showAddEventForm ? 'Close' : 'Add Event'}
        </button>

        <input
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', width: '100%', maxWidth: '300px' }}
        />

        {showAddEventForm && (
          <form className="player-form" onSubmit={handleSubmit}>
            <input name="title" placeholder="Event title" value={formData.title} onChange={handleChange} required />
            <input name="description" placeholder="Description (optional)" value={formData.description} onChange={handleChange} />
            <input name="event_date" type="datetime-local" value={formData.event_date} onChange={handleChange} required />

            {currentUser.role === 'admin' && (
              <label className="checkbox-label">
                <input type="checkbox" name="is_public" checked={formData.is_public} onChange={handleChange} />
                Visible to everyone
              </label>
            )}

            <button type="submit" className="btn-primary">Add Event</button>
          </form>
        )}
      </div>

      <div className="chart-box calendar-box">
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          views={['month', 'week', 'day']}
          view={currentView}
          onView={setCurrentView}
          date={currentDate}
          onNavigate={setCurrentDate}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
        />
      </div>
    </div>
  );
}

export default CalendarView;