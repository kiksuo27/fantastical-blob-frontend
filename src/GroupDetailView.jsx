import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function GroupDetailView() {
  const { groupId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchGroup();
    fetchAllUsers();
  }, [groupId]);

  function fetchGroup() {
    fetch(`${import.meta.env.VITE_API_URL}/groups/${groupId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => {
        setGroup(data);
        setSelectedIds(data.member_ids);
      })
      .catch((error) => console.error('Error fetching group:', error));
  }

  function fetchAllUsers() {
    fetch(`${import.meta.env.VITE_API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setAllUsers(data))
      .catch((error) => console.error('Error fetching users:', error));
  }

  function toggleMember(userId) {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  }

  function saveMembers() {
    fetch(`${import.meta.env.VITE_API_URL}/groups/${groupId}/members`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(selectedIds)
    })
      .then((response) => response.json())
      .then((data) => setGroup(data))
      .catch((error) => console.error('Error updating members:', error));
  }

  function handleDeleteGroup() {
    if (!window.confirm('Delete this group?')) return;

    fetch(`${import.meta.env.VITE_API_URL}/groups/${groupId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => navigate('/groups'))
      .catch((error) => console.error('Error deleting group:', error));
  }

  if (!group) {
    return <div className="page-content"><p>Loading group...</p></div>;
  }

  const members = allUsers.filter((u) => group.member_ids.includes(u.id));

  return (
    <div className="page-content">
      <Link to="/groups" className="back-link">← Back to Groups</Link>
      <header className="app-header">
        <h1>{group.name}</h1>
        <p className="subtitle">{members.length} member{members.length !== 1 ? 's' : ''}</p>
      </header>

      <div className="chart-box">
        <h3>Current Members</h3>
        {members.length === 0 ? (
          <p className="subtitle">No members yet</p>
        ) : (
          <div className="player-grid">
            {members.map((m) => (
              <div className="mini-proficiency" key={m.id}>
                <p className="level" style={{ fontWeight: 600 }}>{m.name}</p>
                <p className="level">{m.role === 'admin' ? 'Admin' : `${m.position} — Year ${m.year}`}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="chart-box">
        <h3>Edit Membership</h3>
        <div className="player-grid">
          {allUsers.map((u) => (
            <label key={u.id} className="checkbox-label" style={{ background: '#f4f5f7', padding: '10px 12px', borderRadius: '8px' }}>
              <input
                type="checkbox"
                checked={selectedIds.includes(u.id)}
                onChange={() => toggleMember(u.id)}
              />
              {u.name} {u.role === 'admin' ? '(Admin)' : `— ${u.position}`}
            </label>
          ))}
        </div>
        <button className="btn-primary" onClick={saveMembers} style={{ marginTop: '16px' }}>
          Save Membership
        </button>
      </div>

      <div className="course-admin-actions">
        <button className="btn-danger" onClick={handleDeleteGroup}>Delete Group</button>
      </div>
    </div>
  );
}

export default GroupDetailView;