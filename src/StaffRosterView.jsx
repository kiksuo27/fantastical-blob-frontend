import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

function StaffRosterView() {
  const { token, currentUser } = useAuth();
  const [staff, setStaff] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    jersey_number: '',
    position: '',
    year: '',
    email: '',
    birthday: ''
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  function handleToggleSuperAdmin(userId, currentValue) {
  fetch(`${import.meta.env.VITE_API_URL}/users/${userId}/super-admin?is_super_admin=${!currentValue}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` }
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          throw new Error(data.detail || 'Failed to update super admin status');
        });
      }
      return response.json();
    })
    .then(() => fetchStaff())
    .catch((error) => alert(error.message));
}

  function fetchStaff() {
    fetch(`${import.meta.env.VITE_API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setStaff(data.filter((u) => u.role === 'admin')))
      .catch((error) => console.error('Error fetching staff:', error));
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
        jersey_number: formData.jersey_number ? parseInt(formData.jersey_number) : 0,
        position: formData.position || 'staff',
        year: formData.year ? parseInt(formData.year) : 0,
        email: formData.email,
        birthday: formData.birthday || null,
        role: 'admin'
      })
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.detail || 'Failed to create staff member');
          });
        }
        return response.json();
      })
      .then(() => {
        setFormData({ name: '', jersey_number: '', position: '', year: '', email: '', birthday: '' });
        setShowAddForm(false);
        fetchStaff();
      })
      .catch((error) => alert(error.message));
  }

  const filteredStaff = staff.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <div className="page-content">
      <Link to="/staff" className="back-link">← Back to Staff Management</Link>
      <header className="app-header">
        <h1>Staff Roster</h1>
      </header>

      <div className="add-card">
        <button className="btn-primary" onClick={() => setShowAddForm((prev) => !prev)}>
          {showAddForm ? 'Close' : 'Add Admin'}
        </button>

        <input
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', width: '100%', maxWidth: '300px' }}
        />

        {showAddForm && (
          <form className="player-form" onSubmit={handleSubmit}>
            <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
            <input name="email" placeholder="Email" type="email" value={formData.email} onChange={handleChange} required />
            <input name="birthday" type="date" value={formData.birthday} onChange={handleChange} />
            <button type="submit" className="btn-primary">Save Admin</button>
          </form>
        )}
      </div>

    <div className="player-grid">
      {filteredStaff.map((member) => (
        <div className="player-card" key={member.id}>
          <h3>{member.name} {member.is_super_admin && '⭐'}</h3>
          <p className="position">{member.email}</p>

          {currentUser?.is_super_admin && member.id !== currentUser.id && (
            <button
              className="btn-secondary"
              onClick={() => handleToggleSuperAdmin(member.id, member.is_super_admin)}
              style={{ marginTop: '8px' }}
            >
              {member.is_super_admin ? 'Remove Super Admin' : 'Make Super Admin'}
          </button>
        )}
      </div>
    ))}
      {staff.length === 0 && <p className="subtitle">No staff yet</p>}
    </div>
  </div>
  );
}

export default StaffRosterView;