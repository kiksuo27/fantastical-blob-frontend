import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function AssessmentManageView() {
  const { assessmentId } = useParams();
  const { token, currentUser } = useAuth();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: '', description: '', is_public: false });
  const [showAddQuestionForm, setShowAddQuestionForm] = useState(false);
  const [questionData, setQuestionData] = useState({ question_text: '', question_type: 'rating', category: '', value_points: '' });
  const [optionFormFor, setOptionFormFor] = useState(null);
  const [optionData, setOptionData] = useState({ label: '', value: '' });
  const [players, setPlayers] = useState([]);
  const [resetPlayerId, setResetPlayerId] = useState('');
  const [resetReason, setResetReason] = useState('');

  useEffect(() => {
    fetchAssessment();
    fetchPlayers();
  }, [assessmentId]);

  function fetchPlayers() {
  fetch(`${import.meta.env.VITE_API_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then((response) => response.json())
    .then((data) => setPlayers(data.filter((u) => u.role === 'player')))
    .catch((error) => console.error('Error fetching players:', error));
  }

  function handleResetData(event) {
    event.preventDefault();
    if (!resetPlayerId) return;
    if (!window.confirm('This will permanently delete this player\'s assessment attempts for this assessment. Continue?')) return;

    fetch(`${import.meta.env.VITE_API_URL}/assessments/${assessmentId}/users/${resetPlayerId}/reset?reason=${encodeURIComponent(resetReason)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.detail || 'Failed to reset data');
          });
        }
        return response.json();
      })
      .then((data) => {
        alert(data.message);
        setResetPlayerId('');
        setResetReason('');
      })
      .catch((error) => alert(error.message));
  }

  function fetchAssessment() {
    fetch(`${import.meta.env.VITE_API_URL}/assessments/${assessmentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setAssessment(data))
      .catch((error) => console.error('Error fetching assessment:', error));
  }

  function startEditing() {
    setEditData({
      title: assessment.title,
      description: assessment.description || '',
      is_public: assessment.is_public
    });
    setIsEditing(true);
  }

  function handleEditChange(event) {
    const { name, value, type, checked } = event.target;
    setEditData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  function handleEditSubmit(event) {
    event.preventDefault();

    fetch(`${import.meta.env.VITE_API_URL}/assessments/${assessmentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(editData)
    })
      .then((response) => response.json())
      .then(() => {
        setIsEditing(false);
        fetchAssessment();
      })
      .catch((error) => console.error('Error updating assessment:', error));
  }

  function handleDeleteAssessment() {
    if (!window.confirm('Are you sure you want to delete this assessment? This cannot be undone.')) return;

    fetch(`${import.meta.env.VITE_API_URL}/assessments/${assessmentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => navigate(-1))
      .catch((error) => console.error('Error deleting assessment:', error));
  }

  function handleQuestionChange(event) {
    const { name, value } = event.target;
    setQuestionData((prev) => ({ ...prev, [name]: value }));
  }

  function handleQuestionSubmit(event) {
    event.preventDefault();

    fetch(`${import.meta.env.VITE_API_URL}/assessments/${assessmentId}/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        question_text: questionData.question_text,
        question_type: questionData.question_type,
        category: questionData.category || null,
        value_points: questionData.value_points ? parseInt(questionData.value_points) : null
      })
    })
      .then((response) => response.json())
      .then(() => {
        setQuestionData({ question_text: '', question_type: 'rating', category: '', value_points: '' });
        setShowAddQuestionForm(false);
        fetchAssessment();
      })
      .catch((error) => console.error('Error creating question:', error));
  }

  function handleDeleteQuestion(questionId) {
    if (!window.confirm('Delete this question and all its options?')) return;

    fetch(`${import.meta.env.VITE_API_URL}/questions/${questionId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchAssessment())
      .catch((error) => console.error('Error deleting question:', error));
  }

  function handleOptionChange(event) {
    const { name, value } = event.target;
    setOptionData((prev) => ({ ...prev, [name]: value }));
  }

  function handleOptionSubmit(event, questionId) {
    event.preventDefault();

    fetch(`${import.meta.env.VITE_API_URL}/questions/${questionId}/options`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        label: optionData.label,
        value: parseInt(optionData.value)
      })
    })
      .then((response) => response.json())
      .then(() => {
        setOptionData({ label: '', value: '' });
        setOptionFormFor(null);
        fetchAssessment();
      })
      .catch((error) => console.error('Error creating option:', error));
  }

  function handleDeleteOption(optionId) {
    fetch(`${import.meta.env.VITE_API_URL}/options/${optionId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchAssessment())
      .catch((error) => console.error('Error deleting option:', error));
  }

  if (!assessment) {
    return <div className="page-content"><p>Loading assessment...</p></div>;
  }

  return (
    <div className="page-content">
      <Link to="/scores" className="back-link">← Back</Link>

      {isEditing ? (
        <form className="player-form" onSubmit={handleEditSubmit} style={{ marginBottom: '24px' }}>
          <input name="title" value={editData.title} onChange={handleEditChange} required />
          <input name="description" value={editData.description} onChange={handleEditChange} />
          <label className="checkbox-label">
            <input type="checkbox" name="is_public" checked={editData.is_public} onChange={handleEditChange} />
            Visible to everyone
          </label>
          <button type="submit" className="btn-primary">Save</button>
          <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
        </form>
      ) : (
        <header className="app-header">
          <h1>{assessment.title}</h1>
          <p className="subtitle">{assessment.description}</p>
        </header>
      )}

      <div className="add-card">
        <button className="btn-primary" onClick={() => setShowAddQuestionForm((prev) => !prev)}>
          {showAddQuestionForm ? 'Close' : 'Add Question'}
        </button>

        {showAddQuestionForm && (
          <form className="player-form" onSubmit={handleQuestionSubmit}>
            <input name="question_text" placeholder="Question text" value={questionData.question_text} onChange={handleQuestionChange} required />
            <select name="question_type" value={questionData.question_type} onChange={handleQuestionChange}>
              <option value="rating">Rating</option>
              <option value="yes_no">Yes/No</option>
              <option value="text">Open Text</option>
            </select>
            <input name="category" placeholder="Category (optional)" value={questionData.category} onChange={handleQuestionChange} />
            <input name="value_points" type="number" placeholder="Points (leave blank if unscored)" value={questionData.value_points} onChange={handleQuestionChange} />
            <button type="submit" className="btn-primary">Save Question</button>
          </form>
        )}
      </div>

      <div className="player-grid">
        {assessment.questions.map((question) => (
          <div className="player-card" key={question.id}>
            <h3>{question.question_text}</h3>
            <p className="position">{question.category || 'No category'}</p>
            <p className="year">{question.question_type} {question.value_points !== null && `— ${question.value_points} pts`}</p>

            {question.options.length > 0 && (
              <div style={{ margin: '8px 0' }}>
                {question.options.map((option) => (
                  <div key={option.id} className="mini-proficiency">
                    <p className="level">{option.label} ({option.value})</p>
                    <button className="btn-danger" onClick={() => handleDeleteOption(option.id)} style={{ marginTop: '4px' }}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="card-actions">
              <button className="btn-secondary" onClick={() => setOptionFormFor(optionFormFor === question.id ? null : question.id)}>
                {optionFormFor === question.id ? 'Close' : 'Add Option'}
              </button>
              <button className="btn-danger" onClick={() => handleDeleteQuestion(question.id)}>Delete Question</button>
            </div>

            {optionFormFor === question.id && (
              <form className="player-form" onSubmit={(e) => handleOptionSubmit(e, question.id)} style={{ marginTop: '12px' }}>
                <input name="label" placeholder="Label (e.g. Yes)" value={optionData.label} onChange={handleOptionChange} required />
                <input name="value" type="number" placeholder="Point value" value={optionData.value} onChange={handleOptionChange} required />
                <button type="submit" className="btn-primary">Save Option</button>
              </form>
            )}
          </div>
        ))}
        {assessment.questions.length === 0 && <p className="subtitle">No questions yet</p>}
      </div>

      {!isEditing && (
        <div className="course-admin-actions">
          <button className="btn-secondary" onClick={startEditing}>Edit Assessment</button>
          <button className="btn-danger" onClick={handleDeleteAssessment}>Delete Assessment</button>
        </div>
      )}

      {currentUser?.is_super_admin && (
        <div className="chart-box" style={{ marginTop: '24px' }}>
          <h3>Reset a Player's Data</h3>
          <p className="subtitle">Permanently deletes their attempt(s) for this assessment so they can retake it.</p>
          <form className="player-form" onSubmit={handleResetData}>
            <select value={resetPlayerId} onChange={(e) => setResetPlayerId(e.target.value)} required>
              <option value="">Select a player</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Reason (optional)"
              value={resetReason}
              onChange={(e) => setResetReason(e.target.value)}
            />
            <button type="submit" className="btn-danger">Reset Player's Data</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default AssessmentManageView;