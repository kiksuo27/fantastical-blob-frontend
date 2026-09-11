import AssessmentView from './AssessmentView';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function StaffAssessmentView() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/assessments?assessment_type=staff`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setAssessments(data))
      .catch((error) => console.error('Error fetching staff assessments:', error));
  }, []);

  return (
    <div className="player-grid">
      {assessments.map((a) => (
        <div className="player-card" key={a.id}>
          <h3>{a.title}</h3>
          <p className="position">{a.description}</p>
          <div className="card-actions">
            <button className="btn-secondary" onClick={() => navigate(`/staff/assessment/${a.id}`)}>Take</button>
            <button className="btn-secondary" onClick={() => navigate(`/staff/assessment/${a.id}/manage`)}>Manage</button>
          </div>
        </div>
      ))}
      {assessments.length === 0 && <p className="subtitle">No staff assessments yet</p>}
    </div>
  );
}

export default StaffAssessmentView;