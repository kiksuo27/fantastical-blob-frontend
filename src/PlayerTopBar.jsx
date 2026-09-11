import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import SearchBar from './SearchBar';

function PlayerTopBar() {
  const { token, currentUser } = useAuth();
  const [now, setNow] = useState(new Date());
  const [proficiency, setProficiency] = useState(null);
  const [assessmentCount, setAssessmentCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);
  const [agendaCount, setAgendaCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/me/proficiency`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setProficiency(data))
      .catch((error) => console.error('Error fetching proficiency:', error));

    fetch(`${import.meta.env.VITE_API_URL}/assessments?assessment_type=player`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setAssessmentCount(data.length))
      .catch((error) => console.error('Error fetching assessments:', error));

    fetch(`${import.meta.env.VITE_API_URL}/courses?content_type=programming`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setCourseCount(data.length))
      .catch((error) => console.error('Error fetching courses:', error));
  }, []);

    fetch(`${import.meta.env.VITE_API_URL}/events/today`, {
        headers: { Authorization: `Bearer ${token}` }
    })
        .then((response) => response.json())
        .then((data) => setAgendaCount(data.length))
        .catch((error) => console.error('Error fetching agenda:', error));

  const formattedDate = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = now.toLocaleTimeString('en-US');

  return (
    <div className="dashboard-top-bar">
      <div className="welcome-corner">
        <h1>Welcome back, {currentUser?.name}</h1>
        <p className="subtitle">{formattedDate} — {formattedTime}</p>
      </div>

      <div className="dashboard-toolbar">
        <SearchBar />
        <Link to="/profile" className="toolbar-item">
            <span className="toolbar-label">My Profile</span>
            <span className="toolbar-value">{currentUser?.name || '...'}</span>
        </Link>

        <Link to="/assessment" className="toolbar-item">
          <span className="toolbar-label">Assessments</span>
          <span className="toolbar-value">{assessmentCount} available</span>
        </Link>
        
        <Link to="/profile" className="toolbar-item">
            <span className="toolbar-label">My Proficiency</span>
            <span className="toolbar-value">{proficiency ? `${proficiency.total_score} pts` : '...'}</span>
        </Link>

        <Link to="/calendar" className="toolbar-item">
            <span className="toolbar-label">Today's Agenda</span>
            <span className="toolbar-value">{agendaCount} {agendaCount === 1 ? 'event' : 'events'}</span>
        </Link>

        <Link to="/programming" className="toolbar-item">
          <span className="toolbar-label">Programming</span>
          <span className="toolbar-value">{courseCount} courses</span>
        </Link>
      </div>
    </div>
  );
}

export default PlayerTopBar;