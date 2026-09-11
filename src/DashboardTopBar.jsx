import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import SearchBar from './SearchBar';

function DashboardTopBar() {
  const { token, currentUser } = useAuth();
  const [now, setNow] = useState(new Date());
  const [lastViewedPlayer, setLastViewedPlayer] = useState(null);
  const [teamAverage, setTeamAverage] = useState(null);
  const [dutyCount, setDutyCount] = useState(0);
  const [agendaCount, setAgendaCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('lastViewedPlayer');
    if (stored) setLastViewedPlayer(JSON.parse(stored));

    fetch(`${import.meta.env.VITE_API_URL}/assessments?assessment_type=player`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((assessmentsList) => {
        if (assessmentsList.length === 0) return;
        const primaryAssessmentId = assessmentsList[0].id;
        return fetch(`${import.meta.env.VITE_API_URL}/analytics/team-average?assessment_id=${primaryAssessmentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
    })
    .then((response) => response && response.json())
    .then((data) => {
      if (data) setTeamAverage(data);
    })
    .catch((error) => console.error('Error fetching team average:', error));

    fetch(`${import.meta.env.VITE_API_URL}/staff-duties/mine`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setDutyCount(data.length))
      .catch((error) => console.error('Error fetching duties:', error));
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
        <Link to={lastViewedPlayer ? `/roster/${lastViewedPlayer.id}` : '/roster'} className="toolbar-item">
          <span className="toolbar-label">Last Viewed</span>
          <span className="toolbar-value">{lastViewedPlayer ? lastViewedPlayer.name : 'None yet'}</span>
        </Link>

        <Link to="/scores" className="toolbar-item">
          <span className="toolbar-label">Team Average</span>
          <span className="toolbar-value">{teamAverage ? teamAverage.average_score : '...'}</span>
        </Link>

        <Link to="/calendar" className="toolbar-item">
          <span className="toolbar-label">Today's Agenda</span>
          <span className="toolbar-value">{agendaCount} {agendaCount === 1 ? 'event' : 'events'}</span>
        </Link>

        <Link to="/staff/duties" className="toolbar-item">
          <span className="toolbar-label">My Duties</span>
          <span className="toolbar-value">{dutyCount} open</span>
        </Link>
      </div>
    </div>
  );
}

export default DashboardTopBar;