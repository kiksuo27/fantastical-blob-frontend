import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from './AuthContext';

function PlayerDetailView() {
  const { playerId } = useParams();
  const { token } = useAuth();
  const [player, setPlayer] = useState(null);
  const [proficiency, setProficiency] = useState(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [resumes, setResumes] = useState([]);


  useEffect(() => {
    fetchPlayer();
    fetchProficiency();
    fetchCategoryBreakdown();
    fetchResumes();
  }, [playerId]);

  function fetchResumes() {
  fetch(`${import.meta.env.VITE_API_URL}/users/${playerId}/resumes`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then((response) => response.json())
    .then((data) => setResumes(data))
    .catch((error) => console.error('Error fetching resumes:', error));
  }

  function fetchPlayer() {
    fetch('${import.meta.env.VITE_API_URL}/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => {
        const found = data.find((p) => p.id === parseInt(playerId));
        setPlayer(found);
        if (found) {
            localStorage.setItem('lastViewedPlayer', JSON.stringify(found));
        }
      })
      .catch((error) => console.error('Error fetching player:', error));
  }

  function fetchProficiency() {
    fetch(`${import.meta.env.VITE_API_URL}/users/${playerId}/proficiency`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setProficiency(data))
      .catch((error) => console.error('Error fetching proficiency:', error));
  }

  function fetchCategoryBreakdown() {
    fetch(`${import.meta.env.VITE_API_URL}/users/${playerId}/category-breakdown`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setCategoryBreakdown(data))
      .catch((error) => console.error('Error fetching category breakdown:', error));
  }

  if (!player) {
    return (
      <div className="page-content">
        <p>Loading player...</p>
      </div>
    );
  }

  return (
    <div className="page-content">
      <Link to="/roster" className="back-link">← Back to Roster</Link>
      <header className="app-header">
        <h1>{player.name}</h1>
        <p className="subtitle">#{player.jersey_number} — {player.position} — Year {player.year}</p>
      </header>
      
      <div className="chart-box">
        <h3>Resume</h3>
        {resumes.length === 0 ? (
          <p className="subtitle">No resume on file</p>
        ) : (
          resumes.map((r) => (
            <a key={r.id} href={r.file_path} target="_blank" rel="noreferrer" className="level" style={{ fontWeight: 600, display: 'block' }}>
              {r.filename}
            </a>
          ))
        )}
      </div>

      <div className="chart-box">
        <h3>Demographics</h3>
        <p><strong>Name:</strong> {player.name}</p>
        <p><strong>Jersey Number:</strong> {player.jersey_number}</p>
        <p><strong>Position:</strong> {player.position}</p>
        <p><strong>Year:</strong> {player.year}</p>
        <p><strong>Birthday:</strong> {player.birthday || 'Not on file'}</p>
        <p><strong>Units:</strong> {[
          player.is_offense && 'Offense',
          player.is_defense && 'Defense',
          player.is_special_teams && 'Special Teams'
        ].filter(Boolean).join(', ') || 'None assigned'}</p>
      </div>

      {proficiency && (
        <div className="proficiency-box">
          <h3>Proficiency</h3>
          <p className="score">{proficiency.total_score} points</p>
          <p className="level">{proficiency.level}</p>
          <Link to={`/assessments/2/users/${playerId}/attempt`} className="btn-secondary" style={{ display: 'inline-block', marginTop: '8px', textDecoration: 'none' }}>
            View Full Attempt
          </Link>
        </div>
      )}

      {categoryBreakdown.length > 0 && (
        <div className="chart-box">
          <h3>Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis domain={[0, 3]} />
              <Tooltip />
              <Bar dataKey="average_score" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default PlayerDetailView;