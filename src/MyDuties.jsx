import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

function MyDuties() {
  const { token } = useAuth();
  const [duties, setDuties] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/staff-duties/mine`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setDuties(data))
      .catch((error) => console.error('Error fetching my duties:', error));
  }, []);

  return (
    <Link to="/staff/duties" className="agenda-link">
      <div className="chart-box">
        <h3>My Duties</h3>
        {duties.length === 0 ? (
          <p className="subtitle">No open duties assigned</p>
        ) : (
          duties.map((duty) => (
            <div className="mini-proficiency" key={duty.id}>
              <p className="level" style={{ fontWeight: 600 }}>{duty.title}</p>
              <p className="level">{duty.status.replace('_', ' ')}</p>
            </div>
          ))
        )}
      </div>
    </Link>
  );
}

export default MyDuties