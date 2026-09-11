import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

function CommunityServiceView() {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ hours: '', organization: '', description: '', service_date: '' });

  useEffect(() => {
    fetchLogs();
  }, []);

  function fetchLogs() {
    fetch(`${import.meta.env.VITE_API_URL}/community-service/mine`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setLogs(data))
      .catch((error) => console.error('Error fetching logs:', error));
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    fetch(`${import.meta.env.VITE_API_URL}/community-service`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        hours: parseFloat(formData.hours),
        organization: formData.organization,
        description: formData.description || null,
        service_date: formData.service_date
      })
    })
      .then((response) => response.json())
      .then(() => {
        setFormData({ hours: '', organization: '', description: '', service_date: '' });
        setShowAddForm(false);
        fetchLogs();
      })
      .catch((error) => console.error('Error creating log:', error));
  }

  function handleDelete(logId) {
    fetch(`${import.meta.env.VITE_API_URL}/community-service/${logId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchLogs())
      .catch((error) => console.error('Error deleting log:', error));
  }

  const totalHours = logs.reduce((sum, log) => sum + log.hours, 0);

  return (
    <div className="page-content">
      <header className="app-header">
        <h1>Community Service</h1>
        <p className="subtitle">Log your community service hours</p>
      </header>

      <div className="stat-box">
        <p className="stat-label">Total Hours Logged</p>
        <p className="stat-value">{totalHours.toFixed(1)}</p>
      </div>

      <div className="add-card">
        <button className="btn-primary" onClick={() => setShowAddForm((prev) => !prev)}>
          {showAddForm ? 'Close' : 'Log Service'}
        </button>

        {showAddForm && (
          <form className="player-form" onSubmit={handleSubmit}>
            <input name="hours" type="number" step="0.5" placeholder="Hours" value={formData.hours} onChange={handleChange} required />
            <input name="organization" placeholder="Organization / who you served with" value={formData.organization} onChange={handleChange} required />
            <input name="description" placeholder="What you did (optional)" value={formData.description} onChange={handleChange} />
            <input name="service_date" type="date" value={formData.service_date} onChange={handleChange} required />
            <button type="submit" className="btn-primary">Save</button>
          </form>
        )}
      </div>

      <div className="chart-box">
        {logs.length === 0 ? (
          <p className="subtitle">No service logged yet</p>
        ) : (
          logs.map((log) => (
            <div className="question-card" key={log.id}>
              <p className="question-text">{log.organization} — {log.hours} hrs</p>
              {log.description && <p className="subtitle">{log.description}</p>}
              <p className="subtitle" style={{ fontSize: '12px' }}>{new Date(log.service_date).toLocaleDateString()}</p>
              <button className="btn-danger" onClick={() => handleDelete(log.id)} style={{ marginTop: '8px' }}>
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CommunityServiceView;