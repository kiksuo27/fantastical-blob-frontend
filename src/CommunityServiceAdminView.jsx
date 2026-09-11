import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

function CommunityServiceAdminView() {
  const { token } = useAuth();
  const [totals, setTotals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerLogs, setPlayerLogs] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/community-service/totals`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setTotals(data))
      .catch((error) => console.error('Error fetching totals:', error));
  }, []);

  function viewPlayerLogs(player) {
    setSelectedPlayer(player);
    fetch(`${import.meta.env.VITE_API_URL}/community-service/users/${player.user_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setPlayerLogs(data))
      .catch((error) => console.error('Error fetching player logs:', error));
  }

  const filteredTotals = totals.filter((t) =>
    t.user_name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <div className="page-content">
      <header className="app-header">
        <h1>Community Service — Team Overview</h1>
      </header>

      <div className="add-card">
        <input
          type="text"
          placeholder="Search player..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', width: '100%', maxWidth: '300px' }}
        />
      </div>

      <div className="player-grid">
        {filteredTotals.map((t) => (
          <div className="player-card" key={t.user_id} onClick={() => viewPlayerLogs(t)} style={{ cursor: 'pointer' }}>
            <h3>{t.user_name}</h3>
            <p className="position">{t.total_hours} hours logged</p>
          </div>
        ))}
        {filteredTotals.length === 0 && <p className="subtitle">No community service logged yet</p>}
      </div>

      {selectedPlayer && (
        <div className="chart-box">
          <h3>{selectedPlayer.user_name}'s Logs</h3>
          {playerLogs.map((log) => (
            <div className="question-card" key={log.id}>
              <p className="question-text">{log.organization} — {log.hours} hrs</p>
              {log.description && <p className="subtitle">{log.description}</p>}
              <p className="subtitle" style={{ fontSize: '12px' }}>{new Date(log.service_date).toLocaleDateString()}</p>
            </div>
          ))}
          {playerLogs.length === 0 && <p className="subtitle">No logs found</p>}
        </div>
      )}
    </div>
  );
}

export default CommunityServiceAdminView;