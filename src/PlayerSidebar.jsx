import { NavLink } from 'react-router-dom';

function PlayerSidebar({ logout }) {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">My Dashboard</h2>
      <nav>
        <NavLink
          to="/home"
          className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
        >
          Home
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
        >
          Profile
        </NavLink>
        <NavLink
          to="/assessment"
          className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
        >
          Assessment
        </NavLink>
        <NavLink
          to="/calendar"
          className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
        >
          Calendar
        </NavLink>
        <NavLink
          to="/programming"
          className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
        >
          Programming
        </NavLink>
        <NavLink
          to="/community-service"
          className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
        >
        Community Service
        </NavLink>
        <NavLink
          to="/surveys"
          className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
        >
          Surveys
        </NavLink>
      </nav>
      <button className="btn-secondary sidebar-logout" onClick={logout}>Log Out</button>
    </div>
  );
}

export default PlayerSidebar;