import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function PartnerDetailView() {
  const { partnerId } = useParams();
  const { token, currentUser } = useAuth();
  const navigate = useNavigate();
  const [partner, setPartner] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', contact_name: '', phone: '', email: '', description: '' });
  
  useEffect(() => {
    fetchPartner();
  }, [partnerId]);

  function fetchPartner() {
    fetch(`${import.meta.env.VITE_API_URL}/partners/${partnerId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setPartner(data))
      .catch((error) => console.error('Error fetching partner:', error));
  }

  function startEditing() {
    setEditData({
      name: partner.name,
      contact_name: partner.contact_name || '',
      phone: partner.phone || '',
      email: partner.email || '',
      description: partner.description || ''
    });
    setIsEditing(true);
  }

  function handleEditChange(event) {
    const { name, value } = event.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  }

  function handleEditSubmit(event) {
    event.preventDefault();

    fetch(`${import.meta.env.VITE_API_URL}/partners/${partnerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(editData)
    })
      .then((response) => response.json())
      .then((data) => {
        setPartner(data);
        setIsEditing(false);
      })
      .catch((error) => console.error('Error updating partner:', error));
  }

  function handleDelete() {
    if (!window.confirm('Delete this partner?')) return;

    fetch(`${import.meta.env.VITE_API_URL}/partners/${partnerId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => navigate(-1))
      .catch((error) => console.error('Error deleting partner:', error));
  }

  if (!partner) {
    return <div className="page-content"><p>Loading partner...</p></div>;
  }

  return (
    <div className="page-content">
      <Link to={`/partners/${partner.category_id}`} className="back-link">← Back</Link>

      {isEditing ? (
        <form className="player-form" onSubmit={handleEditSubmit} style={{ marginBottom: '24px' }}>
          <input name="name" value={editData.name} onChange={handleEditChange} required />
          <input name="contact_name" placeholder="Contact name" value={editData.contact_name} onChange={handleEditChange} />
          <input name="phone" placeholder="Phone" value={editData.phone} onChange={handleEditChange} />
          <input name="email" placeholder="Email" type="email" value={editData.email} onChange={handleEditChange} />
          <input name="description" placeholder="Description" value={editData.description} onChange={handleEditChange} />
          <button type="submit" className="btn-primary">Save</button>
          <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
        </form>
      ) : (
        <>
          <header className="app-header">
            <h1>{partner.name}</h1>
            <p className="subtitle">{partner.description}</p>
          </header>

          <div className="chart-box">
            <p><strong>Contact:</strong> {partner.contact_name || 'Not on file'}</p>
            <p><strong>Phone:</strong> {partner.phone || 'Not on file'}</p>
            <p><strong>Email:</strong> {partner.email || 'Not on file'}</p>
          </div>
        </>
      )}

      {currentUser?.role === 'admin' && !isEditing && (
        <div className="course-admin-actions">
          <button className="btn-secondary" onClick={startEditing}>Edit Partner</button>
          <button className="btn-danger" onClick={handleDelete}>Delete Partner</button>
        </div>
      )}
    </div>
  );
}

export default PartnerDetailView;