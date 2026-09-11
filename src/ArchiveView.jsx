import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

function ArchiveView() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchArchived();
  }, [activeTab]);

  function fetchArchived() {
    fetch(`${import.meta.env.VITE_API_URL}/archive/${activeTab}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setItems(data))
      .catch((error) => console.error('Error fetching archive:', error));
  }

  function handleRestore(id) {
    fetch(`${import.meta.env.VITE_API_URL}/archive/${activeTab}/${id}/restore`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchArchived())
      .catch((error) => console.error('Error restoring item:', error));
  }

  function handlePermanentDelete(id) {
    if (!window.confirm('This will permanently delete this item and cannot be undone. Continue?')) return;

    fetch(`${import.meta.env.VITE_API_URL}/archive/${activeTab}/${id}/permanent`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchArchived())
      .catch((error) => console.error('Error permanently deleting item:', error));
  }

  const displayName = (item) => item.name || item.title;

  return (
    <div className="page-content">
      <header className="app-header">
        <h1>Archive</h1>
        <p className="subtitle">Deleted items can be restored or permanently removed</p>
      </header>

      <div className="unit-tabs">
        <button className={activeTab === 'users' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('users')}>Users</button>
        <button className={activeTab === 'courses' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('courses')}>Courses</button>
        <button className={activeTab === 'assessments' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('assessments')}>Assessments</button>
      </div>

      <div className="player-grid">
        {items.map((item) => (
          <div className="player-card" key={item.id}>
            <h3>{displayName(item)}</h3>
            <p className="year">Deleted {new Date(item.deleted_at).toLocaleString()}</p>
            <div className="card-actions">
              <button className="btn-secondary" onClick={() => handleRestore(item.id)}>Restore</button>
              <button className="btn-danger" onClick={() => handlePermanentDelete(item.id)}>Delete Permanently</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="subtitle">Nothing archived here</p>}
      </div>
    </div>
  );
}

export default ArchiveView;