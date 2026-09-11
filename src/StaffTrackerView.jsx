import { Link } from 'react-router-dom';

function StaffTrackerView() {
  return (
    <div className="page-content">
      <Link to="/staff" className="back-link">← Back to Staff Management</Link>
      <header className="app-header">
        <h1>Staff Tracker</h1>
      </header>

      <div className="player-grid">
        <Link to="/staff/tracker/meetings" className="player-name-link">
          <div className="player-card">
            <h3>Meetings</h3>
            <p className="position">Track what's being discussed and worked on</p>
          </div>
        </Link>

        <Link to="/staff/tracker/events" className="player-name-link">
          <div className="player-card">
            <h3>Events</h3>
            <p className="position">Track what's being worked on for events</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default StaffTrackerView;