import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

function SurveysView() {
  const { token, currentUser } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [groups, setGroups] = useState([]);
  const [players, setPlayers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    question: '', survey_type: 'multiple_choice', optionsText: '', is_public: false,
    assignmentType: 'position', assignmentValue: ''
  });
  const [viewingResponsesFor, setViewingResponsesFor] = useState(null);
  const [responses, setResponses] = useState([]);
  const [draftAnswers, setDraftAnswers] = useState({});
  const [myAnswers, setMyAnswers] = useState({});

  useEffect(() => {
    fetchSurveys();
    if (currentUser?.role === 'admin') {
      fetchGroups();
      fetchPlayers();
    }
  }, [currentUser]);

  function fetchSurveys() {
    fetch(`${import.meta.env.VITE_API_URL}/standalone-surveys`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => {
        setSurveys(data);
        data.forEach((s) => fetchMyAnswer(s.id));
      })
      .catch((error) => console.error('Error fetching surveys:', error));
  }

  function fetchMyAnswer(surveyId) {
    fetch(`${import.meta.env.VITE_API_URL}/standalone-surveys/${surveyId}/my-answer`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => {
        if (data) setMyAnswers((prev) => ({ ...prev, [surveyId]: data }));
      })
      .catch((error) => console.error('Error fetching my answer:', error));
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

    const options = formData.survey_type === 'multiple_choice'
      ? formData.optionsText.split(',').map((opt) => opt.trim()).filter((opt) => opt.length > 0)
      : [];

    const assignments = [];
    if (!formData.is_public && formData.assignmentValue) {
      assignments.push({ assignment_type: formData.assignmentType, value: formData.assignmentValue });
    }

    fetch(`${import.meta.env.VITE_API_URL}/standalone-surveys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        question: formData.question,
        survey_type: formData.survey_type,
        is_public: formData.is_public,
        options,
        assignments
      })
    })
      .then((response) => response.json())
      .then(() => {
        setFormData({ question: '', survey_type: 'multiple_choice', optionsText: '', is_public: false, assignmentType: 'position', assignmentValue: '' });
        setShowAddForm(false);
        fetchSurveys();
      })
      .catch((error) => console.error('Error creating survey:', error));
  }

  function handleDelete(surveyId) {
    if (!window.confirm('Delete this survey?')) return;
    fetch(`${import.meta.env.VITE_API_URL}/standalone-surveys/${surveyId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchSurveys())
      .catch((error) => console.error('Error deleting survey:', error));
  }

  function selectDraftOption(surveyId, optionId) {
    setDraftAnswers((prev) => ({ ...prev, [surveyId]: { option_id: optionId, answer_text: null } }));
  }

  function handleDraftTextChange(surveyId, text) {
    setDraftAnswers((prev) => ({ ...prev, [surveyId]: { option_id: null, answer_text: text } }));
  }

  function submitAnswer(surveyId) {
    const draft = draftAnswers[surveyId];
    if (!draft) return;

    fetch(`${import.meta.env.VITE_API_URL}/standalone-surveys/${surveyId}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(draft)
    })
      .then((response) => response.json())
      .then((data) => setMyAnswers((prev) => ({ ...prev, [surveyId]: data })))
      .catch((error) => console.error('Error submitting answer:', error));
  }

  function viewResponses(surveyId) {
    if (viewingResponsesFor === surveyId) {
      setViewingResponsesFor(null);
      return;
    }
    fetch(`${import.meta.env.VITE_API_URL}/standalone-surveys/${surveyId}/responses`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => {
        setResponses(data);
        setViewingResponsesFor(surveyId);
      })
      .catch((error) => console.error('Error fetching responses:', error));
  }

  return (
    <div className="page-content">
      <header className="app-header">
        <h1>Surveys</h1>
        <p className="subtitle">Polls and surveys for the team</p>
      </header>

      {currentUser?.role === 'admin' && (
        <div className="add-card">
          <button className="btn-primary" onClick={() => setShowAddForm((prev) => !prev)}>
            {showAddForm ? 'Close' : 'New Survey'}
          </button>

          {showAddForm && (
            <form className="player-form" onSubmit={handleSubmit}>
              <input name="question" placeholder="Survey question" value={formData.question} onChange={handleChange} required />
              <select name="survey_type" value={formData.survey_type} onChange={handleChange}>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="open_response">Open Response</option>
              </select>
              {formData.survey_type === 'multiple_choice' && (
                <input name="optionsText" placeholder="Options, comma separated" value={formData.optionsText} onChange={handleChange} required />
              )}

              <label className="checkbox-label">
                <input type="checkbox" name="is_public" checked={formData.is_public} onChange={handleChange} />
                Visible to everyone
              </label>

              {!formData.is_public && (
                <>
                  <select name="assignmentType" value={formData.assignmentType} onChange={handleChange}>
                    <option value="position">Position</option>
                    <option value="unit">Unit</option>
                    <option value="year">Year</option>
                    <option value="group">Custom Group</option>
                    <option value="user">Individual Player</option>
                  </select>
                  {formData.assignmentType === 'group' ? (
                    <select name="assignmentValue" value={formData.assignmentValue} onChange={handleChange}>
                      <option value="">Select a group</option>
                      {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  ) : formData.assignmentType === 'user' ? (
                    <select name="assignmentValue" value={formData.assignmentValue} onChange={handleChange}>
                      <option value="">Select a player</option>
                      {players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  ) : (
                    <input name="assignmentValue" placeholder={formData.assignmentType} value={formData.assignmentValue} onChange={handleChange} />
                  )}
                </>
              )}

              <button type="submit" className="btn-primary">Publish Survey</button>
            </form>
          )}
        </div>
      )}

      {surveys.map((survey) => (
        <div className="chart-box" key={survey.id}>
          <p className="question-text">{survey.question}</p>

          {survey.survey_type === 'open_response' ? (
            <input
              type="text"
              placeholder="Your answer"
              defaultValue={myAnswers[survey.id]?.answer_text || ''}
              onChange={(e) => handleDraftTextChange(survey.id, e.target.value)}
            />
          ) : (
            <div className="option-buttons">
              {survey.options.map((option) => {
                const isSelected = draftAnswers[survey.id]
                  ? draftAnswers[survey.id].option_id === option.id
                  : myAnswers[survey.id]?.option_id === option.id;
                return (
                  <button
                    key={option.id}
                    className={isSelected ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => selectDraftOption(survey.id, option.id)}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          )}

          <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="btn-primary" onClick={() => submitAnswer(survey.id)}>Submit Answer</button>
            {myAnswers[survey.id] && <span className="subtitle">Answer saved</span>}
          </div>

          {currentUser?.role === 'admin' && (
            <div style={{ marginTop: '8px' }}>
              <button className="btn-secondary" onClick={() => viewResponses(survey.id)}>
                {viewingResponsesFor === survey.id ? 'Hide Responses' : 'View Responses'}
              </button>
              {viewingResponsesFor === survey.id && (
                <div style={{ marginTop: '8px' }}>
                  {responses.length === 0 ? (
                    <p className="subtitle">No responses yet</p>
                  ) : (
                    responses.map((r, i) => (
                      <div className="mini-proficiency" key={i}>
                        <p className="level" style={{ fontWeight: 600 }}>{r.user_name}</p>
                        <p className="level">{r.answer}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
              <button className="btn-danger" onClick={() => handleDelete(survey.id)} style={{ marginTop: '8px' }}>
                Delete Survey
              </button>
            </div>
          )}
        </div>
      ))}
      {surveys.length === 0 && <p className="subtitle">No surveys yet</p>}
    </div>
  );
}

export default SurveysView;