import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

function AnnouncementsManageView() {
  const { token } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [groups, setGroups] = useState([]);
  const [players, setPlayers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', body: '', is_public: false, is_pinned: false,
    assignmentType: 'position', assignmentValue: ''
  });

  useEffect(() => {
    fetchAnnouncements();
    fetchGroups();
    fetchPlayers();
  }, []);

  function fetchAnnouncements() {
    fetch(`${import.meta.env.VITE_API_URL}/announcements`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setAnnouncements(data))
      .catch((error) => console.error('Error fetching announcements:', error));
  }

  function fetchGroups() {
    fetch(`${import.meta.env.VITE_API_URL}/groups`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setGroups(data))
      .catch((error) => console.error('Error fetching groups:', error));
  }

  function fetchPlayers() {
    fetch(`${import.meta.env.VITE_API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setPlayers(data))
      .catch((error) => console.error('Error fetching players:', error));
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const assignments = [];
    if (!formData.is_public && formData.assignmentValue) {
      assignments.push({ assignment_type: formData.assignmentType, value: formData.assignmentValue });
    }

    fetch(`${import.meta.env.VITE_API_URL}/announcements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: formData.title,
        body: formData.body,
        is_public: formData.is_public,
        is_pinned: formData.is_pinned,
        assignments
      })
    })
      .then((response) => response.json())
      .then(() => {
        setFormData({ title: '', body: '', is_public: false, is_pinned: false, assignmentType: 'position', assignmentValue: '' });
        setShowAddForm(false);
        fetchAnnouncements();
      })
      .catch((error) => console.error('Error creating announcement:', error));
  }

  function handleTogglePin(announcement) {
    fetch(`${import.meta.env.VITE_API_URL}/announcements/${announcement.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ is_pinned: !announcement.is_pinned })
    })
      .then(() => fetchAnnouncements())
      .catch((error) => console.error('Error updating announcement:', error));
  }

  function handleDelete(announcementId) {
    if (!window.confirm('Delete this announcement?')) return;

    fetch(`${import.meta.env.VITE_API_URL}/announcements/${announcementId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchAnnouncements())
      .catch((error) => console.error('Error deleting announcement:', error));
  }

  function handleImageUpload(event, announcementId) {
    const file = event.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    fetch(`${import.meta.env.VITE_API_URL}/announcements/${announcementId}/images`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: uploadData
    })
      .then(() => fetchAnnouncements())
      .catch((error) => console.error('Error uploading image:', error));
  }

  function handleDeleteImage(imageId) {
    fetch(`${import.meta.env.VITE_API_URL}/announcement-images/${imageId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchAnnouncements())
      .catch((error) => console.error('Error deleting image:', error));
  }

  const filteredAnnouncements = announcements.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <div className="page-content">
      <header className="app-header" style={{ textAlign: 'center' }}>
        <h1>Announcements</h1>
        <p className="subtitle">Post updates for your team</p>
      </header>

      <div className="add-card">
        <button className="btn-primary" onClick={() => setShowAddForm((prev) => !prev)}>
          {showAddForm ? 'Close' : 'New Announcement'}
        </button>

        <input
          type="text"
          placeholder="Search announcements..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', width: '100%', maxWidth: '300px' }}
        />

        {showAddForm && (
          <form className="player-form" onSubmit={handleSubmit}>
            <input name="title" placeholder="Title" value={formData.title} onChange={handleChange} required />
            <input name="body" placeholder="Message" value={formData.body} onChange={handleChange} />

            <label className="checkbox-label">
              <input type="checkbox" name="is_public" checked={formData.is_public} onChange={handleChange} />
              Visible to everyone
            </label>
            <label className="checkbox-label">
              <input type="checkbox" name="is_pinned" checked={formData.is_pinned} onChange={handleChange} />
              Pin to top
            </label>

            {!formData.is_public && (
              <>
                <select name="assignmentType" value={formData.assignmentType} onChange={handleChange}>
                  <option value="position">Position</option>
                  <option value="unit">Unit (offense/defense/special_teams)</option>
                  <option value="year">Year</option>
                  <option value="group">Custom Group</option>
                  <option value="user">Individual Player</option>
                </select>

                {formData.assignmentType === 'group' ? (
                  <select name="assignmentValue" value={formData.assignmentValue} onChange={handleChange}>
                    <option value="">Select a group</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                ) : formData.assignmentType === 'user' ? (
                  <select name="assignmentValue" value={formData.assignmentValue} onChange={handleChange}>
                    <option value="">Select a person</option>
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    name="assignmentValue"
                    placeholder={formData.assignmentType === 'unit' ? 'offense / defense / special_teams' : formData.assignmentType}
                    value={formData.assignmentValue}
                    onChange={handleChange}
                  />
                )}
              </>
            )}

            <button type="submit" className="btn-primary">Post Announcement</button>
          </form>
        )}
      </div>

      {filteredAnnouncements.map((a) => (
  <div className="announcement-card" key={a.id}>
    <div className="announcement-header">
      <p className="announcement-title">{a.is_pinned && '📌 '}{a.title}</p>
      <p className="announcement-meta">{new Date(a.created_at).toLocaleString()}</p>
    </div>

    {a.body && <p className="announcement-body">{a.body}</p>}

    {a.images.length === 1 && (
      <img className="announcement-image-single" src={a.images[0].file_path} alt="" />
    )}

    {a.images.length > 1 && (
      <div className="announcement-image-grid">
        {a.images.slice(0, 4).map((img) => (
          <img key={img.id} className="announcement-image-grid-item" src={img.file_path} alt="" />
        ))}
      </div>
    )}

    {a.images.length > 0 && (
      <div style={{ padding: '12px 16px 0 16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {a.images.map((img) => (
          <button key={img.id} className="btn-danger" onClick={() => handleDeleteImage(img.id)} style={{ fontSize: '12px' }}>
            Remove photo
          </button>
        ))}
      </div>
    )}

    <div className="card-actions" style={{ padding: '12px 16px 16px 16px' }}>
      <button className="btn-secondary" onClick={() => handleTogglePin(a)}>
        {a.is_pinned ? 'Unpin' : 'Pin to Top'}
      </button>
      <label className="btn-secondary" style={{ cursor: 'pointer' }}>
        Add Image
        <input type="file" onChange={(e) => handleImageUpload(e, a.id)} style={{ display: 'none' }} />
      </label>
      <button className="btn-danger" onClick={() => handleDelete(a.id)}>Delete</button>
    </div>
  </div>
))}
      {announcements.length === 0 && <p className="subtitle">No announcements yet</p>}
    </div>
  );
}

export default AnnouncementsManageView;