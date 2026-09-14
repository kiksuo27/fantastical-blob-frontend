import { NavLink} from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useState, useEffect } from 'react';


function Sidebar({ logout }) {
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        document.body.classList.toggle('sidebar-is-collapsed', collapsed);
    }, [collapsed]);
    
    const { currentUser } = useAuth();
    return (
        <div className={collapsed ? 'sidebar sidebar-collapsed' : 'sidebar'}>
            <button
                className="sidebar-toggle"
                onClick={() => setCollapsed((prev) => !prev)}
                aria-label="Toggle sidebar"
            >
                {collapsed ? '»' : '«'}
            </button>
            <h2 className="sidebar-title">Dashboard</h2>
            <nav>
                <NavLink
                    to="dashboard"
                    className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
                >
                    Home
                </NavLink>
                
                 <NavLink
                    to="/roster"
                    className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
                >
                    Player Roster
                </NavLink>
                <NavLink
                    to="/scores"
                    className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
                >
                    Assessment Scores
                </NavLink>
                <NavLink
                    to="/partners"
                    className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
                >
                    Partners
                </NavLink>
                <NavLink
                    to="/programming"
                    className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
                >
                    Programming
                </NavLink>
                <NavLink
                   to="/calendar"
                   className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
                >
                   Calendar
                </NavLink>
                <NavLink
                    to="/staff"
                    className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
                >
                    Staff Management
                </NavLink>
                <NavLink
                    to="/project-boards"
                    className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
                >
                    Project Boards
                </NavLink>
                <NavLink
                    to="/announcements"
                    className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
                >
                    Announcements
                </NavLink>
                <NavLink
                    to="/groups"
                    className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
                >
                    Groups
                </NavLink>
                <NavLink
                    to="/touchpoints"
                    className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
                >
                    Touchpoints
                </NavLink>
                <NavLink
                    to="/archive"
                    className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
                >
                    Archive
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
            {currentUser?.is_super_admin && (
                <NavLink
                    to="/audit-log"
                    className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
                >
                    Audit Log
                </NavLink>
            )}
            </nav>
            <button className="btn-secondary sidebar-logout" onClick={logout}>Log Out</button>
        </div>
    );
}

export default Sidebar;