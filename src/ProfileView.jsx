import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

function ProfileView({ currentUser, token }) {
  const [proficiency, setProficiency] = useState(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [myTrend, setMyTrend] = useState([]);
  const [resumes, setResumes] = useState([]);


  useEffect(() => {
    fetchProficiency();
    fetchCategoryBreakdown();
    fetchMyTrend();
    fetchResumes();
  }, []);

  function fetchResumes() {
    fetch(`${import.meta.env.VITE_API_URL}/users/${currentUser.id}/resumes`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setResumes(data))
      .catch((error) => console.error('Error fetching resumes:', error));
  }

  function handleResumeUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    fetch(`${import.meta.env.VITE_API_URL}/resumes`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: uploadData
    })
      .then(() => fetchResumes())
      .catch((error) => console.error('Error uploading resume:', error));
  }

  function handleDeleteResume(resumeId) {
    fetch(`${import.meta.env.VITE_API_URL}/resumes/${resumeId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchResumes())
      .catch((error) => console.error('Error deleting resume:', error));
  }

  function fetchMyTrend() {
    fetch(`${import.meta.env.VITE_API_URL}/me/attempts-across-assessments`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setMyTrend(data))
      .catch((error) => console.error('Error fetching trend:', error));
  }

  function fetchProficiency() {
    fetch(`${import.meta.env.VITE_API_URL}/me/proficiency`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setProficiency(data))
      .catch((error) => console.error('Error fetching proficiency:', error));
  }

  function fetchCategoryBreakdown() {
    fetch(`${import.meta.env.VITE_API_URL}/me/category-breakdown`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setCategoryBreakdown(data))
      .catch((error) => console.error('Error fetching category breakdown:', error));
  }

  return (
    <div className="page-content">
      <header className="app-header">
        <h1>My Profile</h1>
      </header>

      <div className="player-card">
        <div className="jersey-badge">#{currentUser.jersey_number}</div>
        <h3>{currentUser.name}</h3>
        <p className="position">{currentUser.position}</p>
        <p className="year">Year {currentUser.year}</p>
      </div>

      <div className="chart-box">
        <h3>My Resume</h3>
        {resumes.map((r) => (
          <div className="mini-proficiency" key={r.id}>
          <a href={r.file_path} target="_blank" rel="noreferrer" className="level" style={{ fontWeight: 600 }}>
            {r.filename}
          </a>
          <button className="btn-danger" onClick={() => handleDeleteResume(r.id)} style={{ marginTop: '8px' }}>
            Delete
          </button>
        </div>
      ))}
        <input type="file" onChange={handleResumeUpload} style={{ marginTop: '12px' }} />
      </div>

      <Link to="/assessment" className="btn-primary assessment-link">
        Take Assessment
      </Link>

      {proficiency && (
        <div className="proficiency-box">
          <h3>My Proficiency</h3>
          <p className="score">{proficiency.total_score} points</p>
          <p className="level">{proficiency.level}</p>
        </div>
      )}


      {myTrend.length > 1 && (
        <div className="chart-box">
          <h3>My Progress Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={myTrend.map((t) => ({ ...t, date: new Date(t.submitted_at).toLocaleDateString() }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 20]} />
              <Tooltip />
              <Line type="monotone" dataKey="total_score" stroke="#4f46e5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {categoryBreakdown.length > 0 && (
        <div className="chart-box">
          <h3>My Strengths by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis domain={[0, 3]} />
              <Tooltip />
              <Bar dataKey="average_score" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default ProfileView;