import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function CourseDetailView() {
  const { courseId } = useParams();
  const { token, currentUser } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [showAddModuleForm, setShowAddModuleForm] = useState(false);
  const [moduleData, setModuleData] = useState({ title: '', content: '', order_index: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: '', description: '', is_public: false });
  const [showSurveyFormFor, setShowSurveyFormFor] = useState(null);
  const [surveyData, setSurveyData] = useState({ question: '', optionsText: '', survey_type: 'multiple_choice' });
  const [surveyAnswers, setSurveyAnswers] = useState({});
  const [draftAnswers, setDraftAnswers] = useState({});
  const [viewingResponsesFor, setViewingResponsesFor] = useState(null);
  const [surveyResponses, setSurveyResponses] = useState([]);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  function fetchCourse() {
    fetch(`${import.meta.env.VITE_API_URL}/courses/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => {
        setCourse(data);
        fetchMyAnswers(data);
      })
      .catch((error) => console.error('Error fetching course:', error));
  }

  function fetchMyAnswers(courseData) {
    const allSurveyIds = courseData.modules.flatMap((m) => m.surveys.map((s) => s.id));
    allSurveyIds.forEach((surveyId) => {
      fetch(`${import.meta.env.VITE_API_URL}/surveys/${surveyId}/my-answer`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((response) => response.json())
        .then((data) => {
          if (data) {
            setSurveyAnswers((prev) => ({ ...prev, [surveyId]: data }));
          }
        })
        .catch((error) => console.error('Error fetching survey answer:', error));
    });
  }

  function handleSurveyChange(event) {
    const { name, value } = event.target;
    setSurveyData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSurveySubmit(event, moduleId) {
    event.preventDefault();

    const options = surveyData.survey_type === 'multiple_choice'
      ? surveyData.optionsText.split(',').map((opt) => opt.trim()).filter((opt) => opt.length > 0)
      : [];

    fetch(`${import.meta.env.VITE_API_URL}/modules/${moduleId}/surveys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        question: surveyData.question,
        survey_type: surveyData.survey_type,
        options
      })
    })
      .then((response) => response.json())
      .then(() => {
        setSurveyData({ question: '', optionsText: '', survey_type: 'multiple_choice' });
        setShowSurveyFormFor(null);
        fetchCourse();
      })
      .catch((error) => console.error('Error creating survey:', error));
  }

  function selectDraftOption(surveyId, optionId) {
    setDraftAnswers((prev) => ({ ...prev, [surveyId]: { option_id: optionId, answer_text: null } }));
  }

  function handleDraftTextChange(surveyId, text) {
    setDraftAnswers((prev) => ({ ...prev, [surveyId]: { option_id: null, answer_text: text } }));
  }

  function submitSurveyAnswer(surveyId) {
    const draft = draftAnswers[surveyId];
    if (!draft) return;

    fetch(`${import.meta.env.VITE_API_URL}/surveys/${surveyId}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(draft)
    })
      .then((response) => response.json())
      .then((data) => {
        setSurveyAnswers((prev) => ({ ...prev, [surveyId]: data }));
      })
      .catch((error) => console.error('Error submitting survey answer:', error));
  }

  function handleDeleteSurvey(surveyId) {
    fetch(`${import.meta.env.VITE_API_URL}/surveys/${surveyId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchCourse())
      .catch((error) => console.error('Error deleting survey:', error));
  }

  function viewSurveyResponses(surveyId) {
    if (viewingResponsesFor === surveyId) {
      setViewingResponsesFor(null);
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/surveys/${surveyId}/responses`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => {
        setSurveyResponses(data);
        setViewingResponsesFor(surveyId);
      })
      .catch((error) => console.error('Error fetching survey responses:', error));
  }

  function handleModuleChange(event) {
    const { name, value } = event.target;
    setModuleData((prev) => ({ ...prev, [name]: value }));
  }

  function handleModuleSubmit(event) {
    event.preventDefault();

    fetch(`${import.meta.env.VITE_API_URL}/courses/${courseId}/modules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: moduleData.title,
        content: moduleData.content,
        order_index: parseInt(moduleData.order_index) || 0
      })
    })
      .then((response) => response.json())
      .then(() => {
        setModuleData({ title: '', content: '', order_index: 0 });
        setShowAddModuleForm(false);
        fetchCourse();
      })
      .catch((error) => console.error('Error creating module:', error));
  }

  function startEditingCourse() {
    setEditData({
      title: course.title,
      description: course.description || '',
      is_public: course.is_public
    });
    setIsEditing(true);
  }

  function handleEditChange(event) {
    const { name, value, type, checked } = event.target;
    setEditData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  function handleEditSubmit(event) {
    event.preventDefault();

    fetch(`${import.meta.env.VITE_API_URL}/courses/${courseId}`, {
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
        fetchCourse();
      })
      .catch((error) => console.error('Error updating course:', error));
  }

  function handleDeleteCourse() {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/courses/${courseId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => navigate('/programming'))
      .catch((error) => console.error('Error deleting course:', error));
  }

  if (!course || !currentUser) {
    return <div className="page-content"><p>Loading course...</p></div>;
  }

  return (
    <div className="page-content">
      <Link to="/programming" className="back-link">← Back to Programming</Link>

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
          <h1>{course.title}</h1>
          <p className="subtitle">{course.description}</p>
        </header>
      )}

      {currentUser.role === 'admin' && (
        <div className="add-card">
          <button className="btn-primary" onClick={() => setShowAddModuleForm((prev) => !prev)}>
            {showAddModuleForm ? 'Close' : 'Add Module'}
          </button>

          {showAddModuleForm && (
            <form className="player-form" onSubmit={handleModuleSubmit}>
              <input name="title" placeholder="Module title" value={moduleData.title} onChange={handleModuleChange} required />
              <input name="content" placeholder="Module content" value={moduleData.content} onChange={handleModuleChange} />
              <input name="order_index" type="number" placeholder="Order" value={moduleData.order_index} onChange={handleModuleChange} />
              <button type="submit" className="btn-primary">Save Module</button>
            </form>
          )}
        </div>
      )}

      {course.modules.map((module) => (
        <div className="chart-box" key={module.id}>
          <Link to={`/programming/${courseId}/modules/${module.id}`} className="player-name-link">
            <h3>{module.title}</h3>
          </Link>
          {module.content && <p className="subtitle">{module.content}</p>}

          {module.surveys.map((survey) => (
            <div className="question-card" key={survey.id}>
              <p className="question-text">{survey.question}</p>

              {survey.survey_type === 'open_response' ? (
                <input
                  type="text"
                  placeholder="Type your answer"
                  defaultValue={surveyAnswers[survey.id]?.answer_text || ''}
                  onChange={(e) => handleDraftTextChange(survey.id, e.target.value)}
                />
              ) : (
                <div className="option-buttons">
                  {survey.options.map((option) => {
                    const isSelected = draftAnswers[survey.id]
                      ? draftAnswers[survey.id].option_id === option.id
                      : surveyAnswers[survey.id]?.option_id === option.id;
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
                <button className="btn-primary" onClick={() => submitSurveyAnswer(survey.id)}>
                  Submit Answer
                </button>
                {surveyAnswers[survey.id] && <span className="subtitle">Answer saved</span>}
              </div>

              {currentUser.role === 'admin' && (
                <div style={{ marginTop: '8px' }}>
                  <button className="btn-secondary" onClick={() => viewSurveyResponses(survey.id)}>
                    {viewingResponsesFor === survey.id ? 'Hide Responses' : 'View Responses'}
                  </button>

                  {viewingResponsesFor === survey.id && (
                    <div style={{ marginTop: '8px' }}>
                      {surveyResponses.length === 0 ? (
                        <p className="subtitle">No responses yet</p>
                      ) : (
                        surveyResponses.map((r, index) => (
                          <div className="mini-proficiency" key={index}>
                            <p className="level" style={{ fontWeight: 600 }}>{r.user_name}</p>
                            <p className="level">{r.answer}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  <button className="btn-danger" onClick={() => handleDeleteSurvey(survey.id)} style={{ marginTop: '8px' }}>
                    Delete Survey
                  </button>
                </div>
              )}
            </div>
          ))}

          {currentUser.role === 'admin' && (
            <div className="add-card" style={{ boxShadow: 'none', padding: '12px 0 0 0' }}>
              <button
                className="btn-secondary"
                onClick={() => setShowSurveyFormFor(showSurveyFormFor === module.id ? null : module.id)}
              >
                {showSurveyFormFor === module.id ? 'Close' : 'Add Survey'}
              </button>

              {showSurveyFormFor === module.id && (
                <form className="player-form" onSubmit={(e) => handleSurveySubmit(e, module.id)}>
                  <input
                    name="question"
                    placeholder="Survey question"
                    value={surveyData.question}
                    onChange={handleSurveyChange}
                    required
                  />
                  <select name="survey_type" value={surveyData.survey_type} onChange={handleSurveyChange}>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="open_response">Open Response</option>
                  </select>
                  {surveyData.survey_type === 'multiple_choice' && (
                    <input
                      name="optionsText"
                      placeholder="Options, comma separated (e.g. Yes, No)"
                      value={surveyData.optionsText}
                      onChange={handleSurveyChange}
                      required
                    />
                  )}
                  <button type="submit" className="btn-primary">Save Survey</button>
                </form>
              )}
            </div>
          )}
        </div>
      ))}

      {course.modules.length === 0 && <p className="subtitle">No modules yet</p>}

      {currentUser.role === 'admin' && !isEditing && (
        <div className="course-admin-actions">
          <button className="btn-secondary" onClick={startEditingCourse}>Edit Course</button>
          <button className="btn-danger" onClick={handleDeleteCourse}>Delete Course</button>
        </div>
      )}
    </div>
  );
}

export default CourseDetailView;