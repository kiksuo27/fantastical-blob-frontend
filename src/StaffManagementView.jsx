import { Link } from 'react-router-dom';

function StaffManagementView() {
  return (
    <div className="page-content">
      <header className="app-header">
        <h1>Staff Management</h1>
      </header>

      <div className="player-grid">
        <Link to="/staff/assessment" className="player-name-link">
          <div className="player-card">
            <h3>Staff Assessment</h3>
            <p className="position">Coming soon</p>
          </div>
        </Link>

        <Link to="/staff/duties" className="player-name-link">
          <div className="player-card">
            <h3>Staff Duties</h3>
            <p className="position">Manage assigned duties</p>
          </div>
        </Link>

        <Link to="/staff/tracker" className="player-name-link">
          <div className="player-card">
            <h3>Staff Tracker</h3>
            <p className="position">See what staff is working on</p>
          </div>
        </Link>

        <Link to="/staff/roster" className="player-name-link">
            <div className="player-card">
                <h3>Staff Roster</h3>
                <p className="position">View and manage staff/admins</p>
            </div>
        </Link>
      </div>
    </div>
  );
}

export default StaffManagementView;