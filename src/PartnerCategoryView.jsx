import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function PartnerCategoryView() {
  const { categoryId } = useParams();
  const { token, currentUser } = useAuth();
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', contact_name: '', phone: '', email: '', description: '' });
  const [category, setCategory] = useState(null);
  
  useEffect(() => {
    fetchCategory();
    fetchPartners();
  }, [categoryId]);
  
  function fetchPartners() {
    fetch(`${import.meta.env.VITE_API_URL}/partner-categories/${categoryId}/partners`, {
        headers: { Authorization: `Bearer ${token}` }
    })
        .then((response) => response.json())
        .then((data) => setPartners(data))
        .catch((error) => console.error('Error fetching partners:', error));
  }

  function fetchCategory() {
    fetch(`${import.meta.env.VITE_API_URL}/partner-categories`, {
        headers: { Authorization: `Bearer ${token}` }
       })
        .then((response) => response.json())
        .then((data) => {
            const found = data.find((c) => c.id === parseInt(categoryId));
            setCategory(found);
        })
    .catch((error) => console.error('Error fetching category:', error));
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    fetch(`${import.meta.env.VITE_API_URL}/partner-categories/${categoryId}/partners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    })
      .then((response) => response.json())
      .then(() => {
        setFormData({ name: '', contact_name: '', phone: '', email: '', description: '' });
        setShowAddForm(false);
        fetchPartners();
      })
      .catch((error) => console.error('Error creating partner:', error));
  }

  return (
    <div className="page-content">
      <Link to="/partners" className="back-link">← Back to Partners</Link>
      <header className="app-header">
        <h1>{category ? category.name : 'Loading...'}</h1>
      </header>

      {currentUser?.role === 'admin' && (
        <div className="add-card">
          <button className="btn-primary" onClick={() => setShowAddForm((prev) => !prev)}>
            {showAddForm ? 'Close' : 'Add Partner'}
          </button>

          {showAddForm && (
            <form className="player-form" onSubmit={handleSubmit}>
              <input name="name" placeholder="Partner name" value={formData.name} onChange={handleChange} required />
              <input name="contact_name" placeholder="Contact name (optional)" value={formData.contact_name} onChange={handleChange} />
              <input name="phone" placeholder="Phone (optional)" value={formData.phone} onChange={handleChange} />
              <input name="email" placeholder="Email (optional)" type="email" value={formData.email} onChange={handleChange} />
              <input name="description" placeholder="Short description" value={formData.description} onChange={handleChange} />
              <button type="submit" className="btn-primary">Save Partner</button>
            </form>
          )}
        </div>
      )}

      <div className="player-grid">
        {partners.map((partner) => (
          <div className="player-card" key={partner.id} onClick={() => navigate(`/partners/detail/${partner.id}`)} style={{ cursor: 'pointer' }}>
            <h3>{partner.name}</h3>
            <p className="position">{partner.description}</p>
          </div>
        ))}
        {partners.length === 0 && <p className="subtitle">No partners in this category yet</p>}
      </div>
    </div>
  );
}

export default PartnerCategoryView;