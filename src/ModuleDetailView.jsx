import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

function ModuleDetailView() {
  const { courseId, moduleId } = useParams();
  const { token, currentUser } = useAuth();
  const [module, setModule] = useState(null);

  useEffect(() => {
    fetchModule();
  }, [moduleId]);

  function fetchModule() {
    fetch(`${import.meta.env.VITE_API_URL}/modules/${moduleId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setModule(data))
      .catch((error) => console.error('Error fetching module:', error));
  }

  function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    fetch(`${import.meta.env.VITE_API_URL}/modules/${moduleId}/attachments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: uploadData
    })
      .then((response) => response.json())
      .then(() => fetchModule())
      .catch((error) => console.error('Error uploading file:', error));
  }

  function handleDeleteAttachment(attachmentId) {
    fetch(`${import.meta.env.VITE_API_URL}/attachments/${attachmentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchModule())
      .catch((error) => console.error('Error deleting attachment:', error));
  }

  if (!module) {
    return <div className="page-content"><p>Loading module...</p></div>;
  }

  return (
    <div className="page-content">
      <Link to={`/programming/${courseId}`} className="back-link">← Back to Course</Link>
      <header className="app-header">
        <h1>{module.title}</h1>
        {module.content && <p className="subtitle">{module.content}</p>}
      </header>

      <div className="chart-box">
        <h3>Files & Presentations</h3>

        {module.attachments.length === 0 ? (
          <p className="subtitle">No files uploaded yet</p>
        ) : (
          module.attachments.map((attachment) => (
            <div className="mini-proficiency" key={attachment.id}>
              <a href={attachment.file_path} target="_blank" rel="noreferrer" className="level" style={{ fontWeight: 600 }}>
                {attachment.filename}
              </a>
              {currentUser.role === 'admin' && (
                <button className="btn-danger" onClick={() => handleDeleteAttachment(attachment.id)} style={{ marginTop: '8px' }}>
                  Delete
                </button>
              )}
            </div>
          ))
        )}

        {currentUser.role === 'admin' && (
          <div style={{ marginTop: '16px' }}>
            <input type="file" onChange={handleFileUpload} />
          </div>
        )}
      </div>
    </div>
  );
}

export default ModuleDetailView;