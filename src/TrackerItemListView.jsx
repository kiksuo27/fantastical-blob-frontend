import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

function TrackerItemListView() {
  const { itemType } = useParams(); // "meetings" or "events"
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', item_date: '' });

  const singularType = itemType === 'meetings' ? 'meeting' : 'event';
  const label = itemType === 'meetings' ? 'Meeting' : 'Event';

  useEffect(() => {
    fetchItems();
  }, [itemType]);

  function fetchItems() {
    fetch(`${import.meta.env.VITE_API_URL}/tracker-items?item_type=${singularType}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setItems(data))
      .catch((error) => console.error('Error fetching items:', error));
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    fetch(`${import.meta.env.VITE_API_URL}/tracker-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        item_type: singularType,
        title: formData.title,
        description: formData.description,
        item_date: formData.item_date || null
      })
    })
      .then((response) => response.json())
      .then(() => {
        setFormData({ title: '', description: '', item_date: '' });
        setShowAddForm(false);
        fetchItems();
      })
      .catch((error) => console.error('Error creating item:', error));
  }

  return (
    <div className="page-content">
      <Link to="/staff/tracker" className="back-link">← Back to Tracker</Link>
      <header className="app-header">
        <h1>{label}s</h1>
      </header>

      <div className="add-card">
        <button className="btn-primary" onClick={() => setShowAddForm((prev) => !prev)}>
          {showAddForm ? 'Close' : `Add ${label}`}
        </button>

        {showAddForm && (
          <form className="player-form" onSubmit={handleSubmit}>
            <input name="title" placeholder={`${label} title`} value={formData.title} onChange={handleChange} required />
            <input name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
            <input name="item_date" type="datetime-local" value={formData.item_date} onChange={handleChange} />
            <button type="submit" className="btn-primary">Save {label}</button>
          </form>
        )}
      </div>

      <div className="player-grid">
        {items.map((item) => (
          <Link to={`/staff/tracker/${itemType}/${item.id}`} className="player-name-link" key={item.id}>
            <div className="player-card">
              <h3>{item.title}</h3>
              <p className="position">{item.description}</p>
              {item.item_date && <p className="year">{new Date(item.item_date).toLocaleString()}</p>}
            </div>
          </Link>
        ))}
        {items.length === 0 && <p className="subtitle">No {label.toLowerCase()}s yet</p>}
      </div>
    </div>
  );
}

export default TrackerItemListView;