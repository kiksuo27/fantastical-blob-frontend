import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import './App.css';
import { Link } from 'react-router-dom';

function RosterView() {
  const { token } = useAuth();
  const [players, setPlayers] = useState([]);
  const [showAddPlayerForm, setShowAddPlayerForm] = useState(false);
  const POSITIONS = ['QB', 'WR', 'RB', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P'];
  const [yearFilter, setYearFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    jersey_number: '',
    position: '',
    year: '',
    email: '',
    birthday:'',
    is_offense: false,
    is_defense: false,
    is_special_teams: false
  });


  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    name: '',
    jersey_number: '',
    position: '',
    year: '',
    birthday: '',
    is_offense: false,
    is_defense: false,
    is_special_teams: false
  });
  const [proficiencyData, setProficiencyData] = useState({});
  const [activeUnit, setActiveUnit] = useState('all');

  useEffect(() => {
    fetchPlayers();
  }, []);

  function handleCheckboxChange(event) {
    const { name, checked } = event.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  }

function handleEditCheckboxChange(event) {
    const { name, checked } = event.target;
    setEditData((prev) => ({ ...prev, [name]: checked }));
  }


  function fetchPlayers() {
    fetch(`${import.meta.env.VITE_API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch players');
        return response.json();
      })
      .then((data) => setPlayers(data))
      .catch((error) => console.error('Error fetching players:', error));
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    fetch(`${import.meta.env.VITE_API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: formData.name,
        jersey_number: parseInt(formData.jersey_number),
        position: formData.position,
        year: parseInt(formData.year),
        email: formData.email,
        birthday: formData.birthday || null,
        is_offense: formData.is_offense,
        is_defense: formData.is_defense,
        is_special_teams: formData.is_special_teams,
        role: 'player'
      })
    })
     .then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          throw new Error(data.detail || 'Failed to create player');
        });
      }
      return response.json();
    })
    .then(() => {
      setFormData({ name: '', jersey_number: '', position: '', year: '', email: '', birthday: '', is_offense: false, is_defense: false, is_special_teams: false });
      setShowAddPlayerForm(false);
      fetchPlayers();
    })
    .catch((error) => {
      alert(error.message);
    });
}


  function handleDelete(userId) {
    fetch(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchPlayers())
      .catch((error) => console.error('Error deleting player:', error));
  }

  function startEditing(player) {
    setEditingId(player.id);
    setEditData({
      name: player.name,
      jersey_number: player.jersey_number,
      position: player.position,
      year: player.year,
      birthday: player.birthday ||'',
      is_offense: player.is_offense,
      is_defense: player.is_defense,
      is_special_teams: player.is_special_teams
    });
  }

  function cancelEditing() {
    setEditingId(null);
  }

  function handleEditChange(event) {
    const { name, value } = event.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  }

  function handleEditSubmit(userId) {
    fetch(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: editData.name,
        jersey_number: parseInt(editData.jersey_number),
        position: editData.position,
        year: parseInt(editData.year),
        birthday: editData.birthday || null,
        is_offense: editData.is_offense,
        is_defense: editData.is_defense,
        is_special_teams: editData.is_special_teams
      })
    })
      .then((response) => response.json())
      .then(() => {
        setEditingId(null);
        fetchPlayers();
      })
      .catch((error) => console.error('Error updating player:', error));
  }

  function viewProficiency(userId) {
    fetch(`${import.meta.env.VITE_API_URL}/users/${userId}/proficiency`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch proficiency');
        return response.json();
      })
      .then((data) => {
        setProficiencyData((prev) => ({ ...prev, [userId]: data }));
      })
      .catch((error) => console.error('Error fetching proficiency:', error));
  }


    const filteredPlayers = players.filter((player) => {
        if (activeUnit === 'offense' && !player.is_offense) return false;
        if (activeUnit === 'defense' && !player.is_defense) return false;
        if (activeUnit === 'special_teams' && !player.is_special_teams) return false;
        if (activeUnit === 'admin' && player.role !== 'admin') return false;

        if (yearFilter !== 'all' && String(player.year) !== yearFilter) return false;
        if (positionFilter !== 'all' && player.position !== positionFilter) return false;

        if (searchQuery.trim() && !player.name.toLowerCase().includes(searchQuery.trim().toLowerCase())) return false;

        return true;
    });

  return (
    <div className="page-content">
      <header className="app-header">
        <h1>Player Roster</h1>
        <p className="subtitle">Manage your team's player profiles</p>
      </header>

      <div className="add-cards">
  <div className="add-card">
    <button className="btn-primary" onClick={() => setShowAddPlayerForm((prev) => !prev)}>
      {showAddPlayerForm ? 'Close' : 'Add Player'}
    </button>

    {showAddPlayerForm && (
      <form className="player-form" onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
        <input name="jersey_number" placeholder="Jersey #" type="number" value={formData.jersey_number} onChange={handleChange} required />
        <select name="position" value={formData.position} onChange={handleChange} required>
            <option value="">Select position</option>
            {POSITIONS.map((pos) => (
                <option key={pos} value={pos}>{pos}</option>
            ))}
        </select>

        <input name="year" placeholder="Year" type="number" value={formData.year} onChange={handleChange} required />
        <input name="email" placeholder="Email" type="email" value={formData.email} onChange={handleChange} required />
        <input name="birthday" type="date" value={formData.birthday} onChange={handleChange} />

        <label className="checkbox-label">
          <input type="checkbox" name="is_offense" checked={formData.is_offense} onChange={handleCheckboxChange} />
          Offense
        </label>
        <label className="checkbox-label">
          <input type="checkbox" name="is_defense" checked={formData.is_defense} onChange={handleCheckboxChange} />
          Defense
        </label>
        <label className="checkbox-label">
          <input type="checkbox" name="is_special_teams" checked={formData.is_special_teams} onChange={handleCheckboxChange} />
          Special Teams
        </label>

        <button type="submit" className="btn-primary">Save Player</button>
      </form>
    )}
  </div>
</div>
    
    <div className="unit-tabs">
      <input
        type="text"
        placeholder="Search players..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}
      />

        <button className={activeUnit === 'all' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveUnit('all')}>All</button>
        <button className={activeUnit === 'offense' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveUnit('offense')}>Offense</button>
        <button className={activeUnit === 'defense' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveUnit('defense')}>Defense</button>
        <button className={activeUnit === 'special_teams' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveUnit('special_teams')}>Special Teams</button>

    <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
        <option value="all">All Years</option>
        <option value="1">Year 1</option>
        <option value="2">Year 2</option>
        <option value="3">Year 3</option>
        <option value="4">Year 4</option>
        <option value="5">Year 5</option>
        <option value="6">Year 6</option>
    </select>

    <select value={positionFilter} onChange={(e) => setPositionFilter(e.target.value)}>
        <option value="all">All Positions</option>
        {POSITIONS.map((pos) => (
            <option key={pos} value={pos}>{pos}</option>
        ))}
    </select>
</div>

      <div className="player-grid">
        {filteredPlayers.map((player) =>
          editingId === player.id ? (
            <div className="player-card editing" key={player.id}>
              <input name="name" value={editData.name} onChange={handleEditChange} />
              <input name="jersey_number" type="number" value={editData.jersey_number} onChange={handleEditChange} />
              <select name="position" value={editData.position} onChange={handleEditChange}>
                {POSITIONS.map((pos) => (
                    <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
              <input name="year" type="number" value={editData.year} onChange={handleEditChange} />
              <input name="birthday" type="date" value={editData.birthday} onChange={handleEditChange} />
            
            <label className="checkbox-label">
                <input type="checkbox" name="is_offense" checked={editData.is_offense} onChange={handleEditCheckboxChange} />
                Offense
            </label>
            <label className="checkbox-label">
                <input type="checkbox" name="is_defense" checked={editData.is_defense} onChange={handleEditCheckboxChange} />
                Defense
            </label>
            <label className="checkbox-label">
                <input type="checkbox" name="is_special_teams" checked={editData.is_special_teams} onChange={handleEditCheckboxChange} />
                Special Teams
            </label>
            <label className="checkbox-label">
                <input type="checkbox" name="is_special_teams" checked={editData.is_special_teams} onChange={handleEditCheckboxChange} />
                Special Teams
            </label>
              <div className="card-actions">
                <button className="btn-primary" onClick={() => handleEditSubmit(player.id)}>Save</button>
                <button className="btn-secondary" onClick={cancelEditing}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="player-card" key={player.id}>
              <div className="jersey-badge">#{player.jersey_number}</div>
              <Link to={`/roster/${player.id}`} className="player-name-link">
              <h3>{player.name}</h3>
              </Link>
              <p className="position">{player.position}</p>
              <p className="year">Year {player.year}</p>

              {proficiencyData[player.id] && (
                <div className="mini-proficiency">
                  <p className="score">{proficiencyData[player.id].total_score} pts</p>
                  <p className="level">{proficiencyData[player.id].level}</p>
                </div>
              )}

              <div className="card-actions">
                <button className="btn-secondary" onClick={() => startEditing(player)}>Edit</button>
                <button className="btn-secondary" onClick={() => viewProficiency(player.id)}>
                  {proficiencyData[player.id] ? 'Refresh Score' : 'View Score'}
                </button>
                <button className="btn-danger" onClick={() => handleDelete(player.id)}>Delete</button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default RosterView;