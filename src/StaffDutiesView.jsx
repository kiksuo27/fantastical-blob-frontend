import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

function StaffDutiesView() {
  const { token } = useAuth();
  const [duties, setDuties] = useState([]);
  const [players, setPlayers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', assigned_to: '', status: 'not_started' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ title: '', description: '', assigned_to: '', status: 'not_started' });

  useEffect(() => {
    fetchDuties();
    fetchAdmins();
  }, []);

  function fetchDuties() {
    fetch(`${import.meta.env.VITE_API_URL}/staff-duties`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setDuties(data))
      .catch((error) => console.error('Error fetching duties:', error));
  }

  function fetchAdmins() {
    fetch(`${import.meta.env.VITE_API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setPlayers(data.filter((u) => u.role === 'admin')))
      .catch((error) => console.error('Error fetching admins:', error));
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    fetch(`${import.meta.env.VITE_API_URL}/staff-duties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: formData.title,
        description: formData.description,
        assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : null,
        status: formData.status
      })
    })
      .then((response) => response.json())
      .then(() => {
        setFormData({ title: '', description: '', assigned_to: '', status: 'not_started' });
        setShowAddForm(false);
        fetchDuties();
      })
      .catch((error) => console.error('Error creating duty:', error));
  }

  function handleDelete(dutyId) {
    fetch(`${import.meta.env.VITE_API_URL}/staff-duties/${dutyId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchDuties())
      .catch((error) => console.error('Error deleting duty:', error));
  }

  function startEditing(duty) {
    setEditingId(duty.id);
    setEditData({
      title: duty.title,
      description: duty.description || '',
      assigned_to: duty.assigned_to || '',
      status: duty.status
    });
  }

  function handleEditChange(event) {
    const { name, value } = event.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  }

  function handleEditSubmit(dutyId) {
    fetch(`${import.meta.env.VITE_API_URL}/staff-duties/${dutyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: editData.title,
        description: editData.description,
        assigned_to: editData.assigned_to ? parseInt(editData.assigned_to) : null,
        status: editData.status
      })
    })
      .then((response) => response.json())
      .then(() => {
        setEditingId(null);
        fetchDuties();
      })
      .catch((error) => console.error('Error updating duty:', error));
  }

  function assigneeName(userId) {
    const found = players.find((p) => p.id === userId);
    return found ? found.name : 'Unassigned';
  }

  return (
    <div className="page-content">
      <Link to="/staff" className="back-link">← Back to Staff Management</Link>
      <header className="app-header">
        <h1>Staff Duties</h1>
      </header>

      <div className="add-card">
        <button className="btn-primary" onClick={() => setShowAddForm((prev) => !prev)}>
          {showAddForm ? 'Close' : 'Add Duty'}
        </button>

        {showAddForm && (
          <form className="player-form" onSubmit={handleSubmit}>
            <input name="title" placeholder="Duty title" value={formData.title} onChange={handleChange} required />
            <input name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
            <select name="assigned_to" value={formData.assigned_to} onChange={handleChange}>
              <option value="">Unassigned</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <button type="submit" className="btn-primary">Save Duty</button>
          </form>
        )}
      </div>

      <div className="player-grid">
        {duties.map((duty) =>
          editingId === duty.id ? (
            <div className="player-card editing" key={duty.id}>
              <input name="title" value={editData.title} onChange={handleEditChange} />
              <input name="description" value={editData.description} onChange={handleEditChange} />
              <select name="assigned_to" value={editData.assigned_to} onChange={handleEditChange}>
                <option value="">Unassigned</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <select name="status" value={editData.status} onChange={handleEditChange}>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              <div className="card-actions">
                <button className="btn-primary" onClick={() => handleEditSubmit(duty.id)}>Save</button>
                <button className="btn-secondary" onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="player-card" key={duty.id}>
              <h3>{duty.title}</h3>
              <p className="position">{duty.description}</p>
              <p className="year">Assigned to: {assigneeName(duty.assigned_to)}</p>
              <p className="year">Status: {duty.status.replace('_', ' ')}</p>
              <div className="card-actions">
                <button className="btn-secondary" onClick={() => startEditing(duty)}>Edit</button>
                <button className="btn-danger" onClick={() => handleDelete(duty.id)}>Delete</button>
              </div>
            </div>
          )
        )}
        {duties.length === 0 && <p className="subtitle">No duties yet</p>}
      </div>
    </div>
  );
}

export default StaffDutiesView;