import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

function TodaysAgenda() {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/events/today`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setEvents(data))
      .catch((error) => console.error('Error fetching today\'s events:', error));
  }, []);

  return (
   <Link to="/calendar" className="agenda-link">
    <div className="chart-box">
      <h3>Today's Agenda</h3>
      {events.length === 0 ? (
        <p className="subtitle">Nothing on the calendar today</p>
      ) : (
        events.map((event) => (
          <div className="mini-proficiency" key={event.id}>
            <p className="level" style={{ fontWeight: 600 }}>
                {event.title} - {new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}
            </p>
            {event.description && <p className="level">{event.description}</p>}
          </div>
        ))
      )}
    </div>
  </Link>
  );
}

export default TodaysAgenda;