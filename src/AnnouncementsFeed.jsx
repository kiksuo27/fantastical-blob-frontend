import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

function AnnouncementsFeed() {
  const { token } = useAuth();
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/announcements`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setAnnouncements(data))
      .catch((error) => console.error('Error fetching announcements:', error));
  }, []);

  return (
    <div>
      <h3 style={{ marginBottom: '12px', textAlign: 'center' }}>Announcements</h3>
      {announcements.length === 0 ? (
        <p className="subtitle">No announcements yet</p>
      ) : (
        announcements.map((a) => (
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
          </div>
        ))
      )}
    </div>
  );
}

export default AnnouncementsFeed;