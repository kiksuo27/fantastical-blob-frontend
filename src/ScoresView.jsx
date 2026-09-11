import { useState, useEffect } from 'react';
import { BarChart, Bar,PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useAuth } from './AuthContext';
import { Link } from 'react-router-dom';


function scoreToLevel(score) {
  if (score >= 18) return 'Highly Advanced';
  if (score >= 16) return 'Advanced';
  if (score >= 13) return 'Intermediate';
  if (score >= 10) return 'Novice';
  return '';
}

function formatDuration(seconds) {
  if (seconds === null || seconds === undefined) return '—';
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function ScoresView() {
  const { token } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState('');
  const [teamAverage, setTeamAverage] = useState(null);
  const [groupBy, setGroupBy] = useState('position');
  const [filteredScores, setFilteredScores] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [durationsByGroup, setDurationsByGroup] = useState([]);
  const [categoryTiming, setCategoryTiming] = useState([]);
  const [rapidResponses, setRapidResponses] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/assessments?assessment_type=player`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => {
        setAssessments(data);
        if (data.length > 0) setSelectedAssessment(String(data[0].id));
      })
      .catch((error) => console.error('Error fetching assessments:', error));
  }, []);

  useEffect(() => {
    if (!selectedAssessment) return;
    fetchTeamAverage();
    fetchFilteredScores();
    fetchCategoryData();
    fetchTrend();
    fetchDurations();
    fetchCategoryTiming();
    fetchRapidResponses();
  }, [selectedAssessment, groupBy]);

  function fetchDurations() {
    fetch(`${import.meta.env.VITE_API_URL}/analytics/durations?assessment_id=${selectedAssessment}&group_by=${groupBy === 'year' ? 'position' : groupBy}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setDurationsByGroup(data))
      .catch((error) => console.error('Error fetching durations:', error));
  }

  function fetchCategoryTiming() {
    fetch(`${import.meta.env.VITE_API_URL}/analytics/category-timing?assessment_id=${selectedAssessment}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setCategoryTiming(data))
      .catch((error) => console.error('Error fetching category timing:', error));
  }

  function fetchRapidResponses() {
    fetch(`${import.meta.env.VITE_API_URL}/analytics/rapid-responses?assessment_id=${selectedAssessment}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setRapidResponses(data))
      .catch((error) => console.error('Error fetching rapid responses:', error));
  }

  function fetchCategoryData() {
    fetch(`${import.meta.env.VITE_API_URL}/analytics/by-category?assessment_id=${selectedAssessment}`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then((response) => response.json())
    .then((data) => setCategoryData(data))
    .catch((error) => console.error('Error fetching category data:', error));
  }

  function fetchTeamAverage() {
    fetch(`${import.meta.env.VITE_API_URL}/analytics/team-average?assessment_id=${selectedAssessment}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setTeamAverage(data))
      .catch((error) => console.error('Error fetching team average:', error));
  }

   function fetchTrend() {
    fetch(`${import.meta.env.VITE_API_URL}/analytics/trend?assessment_id=${selectedAssessment}`, {
        headers: { Authorization: `Bearer ${token}` }
    })
        .then((response) => response.json())
        .then((data) => setTrendData(data))
        .catch((error) => console.error('Error fetching trend:', error));
  }

  function fetchFilteredScores() {
    fetch(`${import.meta.env.VITE_API_URL}/analytics/filtered-scores?assessment_id=${selectedAssessment}&group_by=${groupBy}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setFilteredScores(data))
      .catch((error) => console.error('Error fetching filtered scores:', error));
  }

    const COLORS = ['#4f46e5', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0891b2'];
  
  return (
    <div className="page-content">
      <header className="app-header">
        <h1>Assessment Scores</h1>
        <p className="subtitle">Team-wide analytics and trends</p>
      </header>

      <div className="unit-tabs">
        <select value={selectedAssessment} onChange={(e) => setSelectedAssessment(e.target.value)}>
          {assessments.map((a) => (
            <option key={a.id} value={a.id}>{a.title}</option>
          ))}
        </select>
        {selectedAssessment && (
            <Link to={`/assessments/${selectedAssessment}/manage`} className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', padding: '0 16px' }}>
                Manage Questions
            </Link>
        )}
      </div>

      {teamAverage && (
        <div className="stat-box">
          <p className="stat-label">Team Average Score</p>
          <p className="stat-value">{teamAverage.average_score}</p>
          <p className="stat-sub">{teamAverage.level} — {teamAverage.player_count} players scored</p>
        </div>
      )}

      <div className="chart-box">
        <h3>Average Score by {groupBy === 'position' ? 'Position' : groupBy === 'year' ? 'Year' : 'Unit'}</h3>
        <div className="unit-tabs">
          <button className={groupBy === 'position' ? 'btn-primary' : 'btn-secondary'} onClick={() => setGroupBy('position')}>Position</button>
          <button className={groupBy === 'year' ? 'btn-primary' : 'btn-secondary'} onClick={() => setGroupBy('year')}>Year</button>
          <button className={groupBy === 'unit' ? 'btn-primary' : 'btn-secondary'} onClick={() => setGroupBy('unit')}>Unit</button>
        </div>

    <div className="chart-box">
        <h3>Score Trend Over Time</h3>
        {trendData.length > 1 ? (
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 20]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="average_score" stroke="#4f46e5" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        ) : (
            <p className="subtitle">Trends will appear once this assessment has been taken on multiple dates</p>
        )}
    </div>   

        <div className="chart-box">
            <h3>Average Score by Category</h3>
            {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis domain={[0, 3]} />
                        <Tooltip />
                        <Bar dataKey="average_score" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <p className="subtitle">No category data yet</p>
            )}
        </div>
        
        <div className="chart-box">
            <h3>Score Distribution by Category</h3>
            {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={categoryData}
                            dataKey="average_score"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.category}: ${entry.average_score}`}
                        >
                            {categoryData.map((entry, index) => (
                                <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                            ))}
                         </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <p className="subtitle">No category data yet</p>
            )}
        </div>
        
        <div className="chart-box">
          <h3>Average Score by {groupBy === 'position' ? 'Position' : groupBy === 'year' ? 'Year' : 'Unit'}</h3>
          <div className="unit-tabs">
            <button className={groupBy === 'position' ? 'btn-primary' : 'btn-secondary'} onClick={() => setGroupBy('position')}>Position</button>
            <button className={groupBy === 'year' ? 'btn-primary' : 'btn-secondary'} onClick={() => setGroupBy('year')}>Year</button>
            <button className={groupBy === 'unit' ? 'btn-primary' : 'btn-secondary'} onClick={() => setGroupBy('unit')}>Unit</button>
          </div>

          {filteredScores.length > 0 ? (
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={filteredScores} margin={{ left: 20, top: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="group" />
                <YAxis domain={[0, 21]} ticks={[10, 13, 16, 18]} tickFormatter={scoreToLevel} width={100} interval={0} />
                <Tooltip formatter={(value) => [value, 'Average Score']} />
                <Bar dataKey="average_score" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="subtitle">No data yet</p>
          )}
        </div>

        <div className="chart-box">
          <h3>Average Time by {groupBy === 'position' ? 'Position' : 'Unit'}</h3>
          {durationsByGroup.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={durationsByGroup}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="group" />
                <YAxis tickFormatter={formatDuration} />
                <Tooltip formatter={(value) => [formatDuration(value), 'Avg Time']} />
                <Bar dataKey="average_seconds" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="subtitle">No timing data yet</p>
          )}
        </div>

        <div className="chart-box">
          <h3>Average Time by Category</h3>
          {categoryTiming.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryTiming}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis tickFormatter={formatDuration} />
                <Tooltip formatter={(value) => [formatDuration(value), 'Avg Time']} />
                <Bar dataKey="average_seconds" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="subtitle">No category timing data yet</p>
          )}
        </div>

        <div className="chart-box">
          <h3>Rapid Responses (≤1.5s)</h3>
          {rapidResponses.length === 0 ? (
            <p className="subtitle">No rapid responses detected</p>
          ) : (
            rapidResponses.map((r) => (
              <div className="mini-proficiency" key={r.question_id}>
                <p className="level" style={{ fontWeight: 600 }}>{r.question_text}</p>
                <p className="level">{r.rapid_count} of {r.total_count} responses ({r.rapid_rate}%)</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ScoresView;