import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function formatDuration(seconds) {
  if (seconds === null || seconds === undefined) return '—';
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function AttemptDetailView() {
  const { assessmentId, userId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [detail, setDetail] = useState(null);
  const [playerName, setPlayerName] = useState('');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/assessments/${assessmentId}/users/${userId}/attempt-detail`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => {
        if (!response.ok) throw new Error('No attempt found');
        return response.json();
      })
      .then((data) => setDetail(data))
      .catch((error) => console.error('Error fetching attempt detail:', error));

    fetch(`${import.meta.env.VITE_API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => {
        const player = data.find((p) => p.id === parseInt(userId));
        if (player) setPlayerName(player.name);
      })
      .catch((error) => console.error('Error fetching player:', error));
  }, [assessmentId, userId]);

  if (!detail) {
    return (
      <div className="assessment-focus-mode">
        <p>Loading attempt...</p>
      </div>
    );
  }

  return (
    <div className="assessment-focus-mode">
      <div className="assessment-focus-header">
        <button className="btn-secondary" onClick={() => navigate(-1)}>Back</button>
        <h1>{playerName}'s Attempt</h1>
        <p className="subtitle">
          {detail.total_score} points — {detail.level} — Duration: {formatDuration(detail.duration_seconds)}
        </p>
        <p className="subtitle" style={{ fontSize: '12px' }}>
          Submitted {new Date(detail.submitted_at).toLocaleString()}
        </p>
      </div>

      <div className="assessment-box">
        {detail.answers.map((a) => (
          <div className="question-card" key={a.question_id}>
            <p className="question-text">{a.question_text}</p>
            <p className="subtitle">Answer: <strong>{a.answer_label || 'No answer'}</strong></p>
            <p className="subtitle" style={{ fontSize: '12px' }}>Time taken: {formatDuration(a.time_taken_seconds)}</p>
          </div>
        ))}
        {detail.answers.length === 0 && <p className="subtitle">No answers recorded</p>}
      </div>
    </div>
  );
}

export default AttemptDetailView;