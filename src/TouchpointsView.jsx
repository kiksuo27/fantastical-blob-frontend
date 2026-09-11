import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from './AuthContext';

const MEETING_TYPES = ['Life Skills', 'Community Service', 'Professionalism', 'Other'];

function TouchpointsView() {
  const { token } = useAuth();
  const [touchpoints, setTouchpoints] = useState([]);
  const [players, setPlayers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [playerSearch, setPlayerSearch] = useState('');
  const [showPlayerResults, setShowPlayerResults] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [meetingType, setMeetingType] = useState('Life Skills');
  const [notes, setNotes] = useState('');

  const [groupBy, setGroupBy] = useState('position');
  const [period, setPeriod] = useState('month');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [frequencyData, setFrequencyData] = useState([]);

  useEffect(() => {
    fetchTouchpoints();
    fetchPlayers();
  }, []);

  useEffect(() => {
    fetchFrequency();
  }, [groupBy, period, date]);

  function fetchTouchpoints() {
    fetch(`${import.meta.env.VITE_API_URL}/touchpoints`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setTouchpoints(data))
      .catch((error) => console.error('Error fetching touchpoints:', error));
  }

  function fetchPlayers() {
    fetch(`${import.meta.env.VITE_API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setPlayers(data))
      .catch((error) => console.error('Error fetching players:', error));
  }

  function fetchFrequency() {
    fetch(`${import.meta.env.VITE_API_URL}/analytics/touchpoint-frequency?group_by=${groupBy}&period=${period}&date=${date}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setFrequencyData(data))
      .catch((error) => console.error('Error fetching frequency:', error));
  }

  const playerResults = playerSearch.trim().length >= 1
    ? players.filter((p) => p.name.toLowerCase().includes(playerSearch.trim().toLowerCase()))
    : [];

  function handleSelectPlayer(player) {
    setSelectedPlayer(player);
    setPlayerSearch(player.name);
    setShowPlayerResults(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!selectedPlayer) {
      alert('Please select a player');
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/touchpoints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        user_id: selectedPlayer.id,
        meeting_type: meetingType,
        notes: notes || null
      })
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.detail || 'Failed to log touchpoint');
          });
        }
        return response.json();
      })
      .then(() => {
        setSelectedPlayer(null);
        setPlayerSearch('');
        setMeetingType('Life Skills');
        setNotes('');
        setShowAddForm(false);
        fetchTouchpoints();
      })
      .catch((error) => alert(error.message));
  }

  function handleDelete(touchpointId) {
    fetch(`${import.meta.env.VITE_API_URL}/touchpoints/${touchpointId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchTouchpoints())
      .catch((error) => console.error('Error deleting touchpoint:', error));
  }

  function playerName(userId) {
    const found = players.find((p) => p.id === userId);
    return found ? found.name : `Player #${userId}`;
  }

  return (
    <div className="page-content">
      <header className="app-header">
        <h1>Touchpoints</h1>
        <p className="subtitle">Log meetings and check-ins with student-athletes</p>
      </header>

      <div className="add-card">
        <button className="btn-primary" onClick={() => setShowAddForm((prev) => !prev)}>
          {showAddForm ? 'Close' : 'Add Touchpoint'}
        </button>

        {showAddForm && (
          <form className="player-form" onSubmit={handleSubmit}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search player by name..."
                value={playerSearch}
                onChange={(e) => {
                  setPlayerSearch(e.target.value);
                  setSelectedPlayer(null);
                  setShowPlayerResults(true);
                }}
                onFocus={() => setShowPlayerResults(true)}
                required
              />
              {showPlayerResults && playerResults.length > 0 && (
                <div className="search-results">
                  {playerResults.map((p) => (
                    <div key={p.id} className="search-result-item" onClick={() => handleSelectPlayer(p)}>
                      <span className="search-result-title">{p.name}</span>
                      <span className="search-result-type">{p.position}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <select value={meetingType} onChange={(e) => setMeetingType(e.target.value)}>
              {MEETING_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <textarea
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontFamily: 'inherit', fontSize: '14px' }}
            />

            <button type="submit" className="btn-primary">Save Touchpoint</button>
          </form>
        )}
      </div>

      <div className="chart-box">
        <h3>Touchpoint Frequency</h3>
        <div className="unit-tabs">
          <button className={groupBy === 'person' ? 'btn-primary' : 'btn-secondary'} onClick={() => setGroupBy('person')}>By Person</button>
          <button className={groupBy === 'position' ? 'btn-primary' : 'btn-secondary'} onClick={() => setGroupBy('position')}>By Position</button>
          <button className={groupBy === 'unit' ? 'btn-primary' : 'btn-secondary'} onClick={() => setGroupBy('unit')}>By Unit</button>

          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="day">Day</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>

          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        {frequencyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={Math.max(300, frequencyData.length * 40)}>
            <BarChart data={frequencyData} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 25]} ticks={[0, 5, 10, 15, 20, 25]} />
              <YAxis type="category" dataKey="group" width={120} />
              <Tooltip />
              <Bar dataKey="frequency" fill="#4f46e5" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="subtitle">No touchpoints logged for this period yet</p>
        )}
      </div>

      <div className="chart-box">
        <h3>Recent Touchpoints</h3>
        {touchpoints.length === 0 ? (
          <p className="subtitle">No touchpoints logged yet</p>
        ) : (
          touchpoints.map((tp) => (
            <div className="question-card" key={tp.id}>
              <p className="question-text">{playerName(tp.user_id)} — {tp.meeting_type}</p>
              {tp.notes && <p className="subtitle">{tp.notes}</p>}
              <p className="subtitle" style={{ fontSize: '12px', color: '#9ca3af' }}>
                {new Date(tp.created_at).toLocaleString()}
              </p>
              <button className="btn-danger" onClick={() => handleDelete(tp.id)} style={{ marginTop: '8px' }}>
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TouchpointsView;