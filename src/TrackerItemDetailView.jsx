import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

function TrackerItemDetailView() {
  const { itemType, itemId } = useParams();
  const { token, currentUser } = useAuth();
  const [item, setItem] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [note, setNote] = useState('');

  useEffect(() => {
    fetchItem();
    fetchUpdates();
  }, [itemId]);

  function fetchItem() {
    fetch(`${import.meta.env.VITE_API_URL}/tracker-items/${itemId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setItem(data))
      .catch((error) => console.error('Error fetching item:', error));
  }

  function fetchUpdates() {
    fetch(`${import.meta.env.VITE_API_URL}/tracker-items/${itemId}/updates`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setUpdates(data))
      .catch((error) => console.error('Error fetching updates:', error));
  }

  function handleSubmit(event) {
    event.preventDefault();

    fetch(`${import.meta.env.VITE_API_URL}/tracker-items/${itemId}/updates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ note })
    })
      .then((response) => response.json())
      .then(() => {
        setNote('');
        fetchUpdates();
      })
      .catch((error) => console.error('Error posting update:', error));
  }

  if (!item) {
    return <div className="page-content"><p>Loading...</p></div>;
  }

  return (
    <div className="page-content">
      <Link to={`/staff/tracker/${itemType}`} className="back-link">← Back</Link>
      <header className="app-header">
        <h1>{item.title}</h1>
        {item.description && <p className="subtitle">{item.description}</p>}
        {item.item_date && <p className="subtitle">{new Date(item.item_date).toLocaleString()}</p>}
      </header>

      <div className="chart-box">
        <form className="player-form" onSubmit={handleSubmit}>
          <input
            placeholder="What are you working on for this?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary">Post Update</button>
        </form>
      </div>

      <div className="chart-box">
        {updates.length === 0 ? (
          <p className="subtitle">No updates yet</p>
        ) : (
          updates.map((update) => (
            <div className="mini-proficiency" key={update.id}>
              <p className="level" style={{ fontWeight: 600 }}>
                {update.user_id === currentUser.id ? `You (${update.user_name})` : update.user_name}
              </p>
              <p className="level">{update.note}</p>
              <p className="level" style={{ fontSize: '11px', color: '#9ca3af' }}>
                {new Date(update.posted_at).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TrackerItemDetailView;