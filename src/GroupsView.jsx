import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

function GroupsView() {
  const { token } = useAuth();
  const [groups, setGroups] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  function fetchGroups() {
    fetch(`${import.meta.env.VITE_API_URL}/groups`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setGroups(data))
      .catch((error) => console.error('Error fetching groups:', error));
  }

  function handleSubmit(event) {
    event.preventDefault();

    fetch(`${import.meta.env.VITE_API_URL}/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name: groupName, member_ids: [] })
    })
      .then((response) => response.json())
      .then(() => {
        setGroupName('');
        setShowAddForm(false);
        fetchGroups();
      })
      .catch((error) => console.error('Error creating group:', error));
  }

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <div className="page-content">
      <header className="app-header">
        <h1>Groups</h1>
        <p className="subtitle">Custom groups for targeting content and assessments</p>
      </header>

      <div className="add-card">
        <button className="btn-primary" onClick={() => setShowAddForm((prev) => !prev)}>
          {showAddForm ? 'Close' : 'New Group'}
        </button>

        <input
          type="text"
          placeholder="Search groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', width: '100%', maxWidth: '300px' }}
        />

        {showAddForm && (
          <form className="player-form" onSubmit={handleSubmit}>
            <input
              placeholder="Group name (e.g. Injured Players)"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary">Create Group</button>
          </form>
        )}
      </div>

      <div className="player-grid">
        {filteredGroups.map((group) => (
          <Link to={`/groups/${group.id}`} className="player-name-link" key={group.id}>
            <div className="player-card">
              <h3>{group.name}</h3>
              <p className="position">{group.member_ids.length} member{group.member_ids.length !== 1 ? 's' : ''}</p>
            </div>
          </Link>
        ))}
        {groups.length === 0 && <p className="subtitle">No groups yet</p>}
      </div>
    </div>
  );
}

export default GroupsView;