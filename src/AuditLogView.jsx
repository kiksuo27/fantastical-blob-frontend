import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

function AuditLogView() {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/audit-log`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch audit log');
        return response.json();
      })
      .then((data) => setLogs(data))
      .catch((error) => console.error('Error fetching audit log:', error));
  }, []);

  return (
    <div className="page-content">
      <header className="app-header">
        <h1>Audit Log</h1>
        <p className="subtitle">A record of sensitive actions taken by admins</p>
      </header>

      <div className="chart-box">
        {logs.length === 0 ? (
          <p className="subtitle">No audit entries yet</p>
        ) : (
          logs.map((log) => (
            <div className="question-card" key={log.id}>
              <p className="question-text">{log.action.replace(/_/g, ' ')}</p>
              <p className="subtitle">
                {log.target_type}{log.target_id ? ` #${log.target_id}` : ''} — by user #{log.actor_id}
              </p>
              {log.reason && <p className="subtitle">Reason: {log.reason}</p>}
              <p className="subtitle" style={{ fontSize: '12px', color: '#9ca3af' }}>
                {new Date(log.created_at).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AuditLogView;