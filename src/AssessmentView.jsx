import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function AssessmentView() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [assessment, setAssessment] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timings, setTimings] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  const questionStartRef = useRef(null);
  const attemptStartRef = useRef(null);

  useEffect(() => {
    if (assessmentId) {
      fetchAssessment();
    } else {
      fetchAssessmentList();
    }
  }, [assessmentId]);

  useEffect(() => {
    if (assessment) {
      attemptStartRef.current = Date.now();
      questionStartRef.current = Date.now();
    }
  }, [assessment]);

  function fetchAssessmentList() {
    fetch(`${import.meta.env.VITE_API_URL}/assessments?assessment_type=player`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setAssessments(data))
      .catch((error) => console.error('Error fetching assessments:', error));
  }

  function fetchAssessment() {
    fetch(`${import.meta.env.VITE_API_URL}/assessments/${assessmentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setAssessment(data))
      .catch((error) => console.error('Error fetching assessment:', error));
  }

  function recordTiming(questionId) {
    const elapsed = (Date.now() - questionStartRef.current) / 1000;
    setTimings((prev) => ({ ...prev, [questionId]: elapsed }));
  }

  function selectAnswer(questionId, value) {
    recordTiming(questionId);
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function handleTextAnswer(questionId, value) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function goNext() {
    const question = assessment.questions[currentIndex];
    if (!timings[question.id]) {
      recordTiming(question.id);
    }
    questionStartRef.current = Date.now();
    setCurrentIndex((prev) => prev + 1);
  }

  function goBack() {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }

  function handleFinalSubmit() {
    const question = assessment.questions[currentIndex];
    if (!timings[question.id]) {
      recordTiming(question.id);
    }

    const totalDuration = (Date.now() - attemptStartRef.current) / 1000;

    const answerList = Object.entries(answers).map(([questionId, answerValue]) => {
      const q = assessment.questions.find((qq) => qq.id === parseInt(questionId));
      const isText = q && q.options.length === 0;
      return {
        question_id: parseInt(questionId),
        answer_value: isText ? null : answerValue,
        answer_text: isText ? answerValue : null,
        time_taken_seconds: timings[questionId] || null
      };
    });

    fetch(`${import.meta.env.VITE_API_URL}/assessments/${assessmentId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ answers: answerList, duration_seconds: totalDuration })
    })
      .then((response) => response.json())
      .then((data) => {
        setSubmitted(true);
        setResult(data);
      })
      .catch((error) => console.error('Error submitting assessment:', error));
  }

  // Picker list — no assessment id in the URL
  if (!assessmentId) {
    return (
      <div className="page-content">
        <header className="app-header">
          <h1>Assessments</h1>
          <p className="subtitle">Choose an assessment to take</p>
        </header>

        <div className="player-grid">
          {assessments.map((a) => (
            <div
              className="player-card"
              key={a.id}
              onClick={() => navigate(`/assessment/${a.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <h3>{a.title}</h3>
              <p className="position">{a.description}</p>
            </div>
          ))}
          {assessments.length === 0 && <p className="subtitle">No assessments available yet</p>}
        </div>
      </div>
    );
  }

  if (!assessment) {
    return <div className="page-content"><p>Loading assessment...</p></div>;
  }

  if (submitted) {
    return (
      <div className="assessment-focus-mode">
        <div className="proficiency-box">
          <h3>Results</h3>
          <p className="score">{result.total_score} points</p>
          <p className="level">{result.level}</p>
          <button className="btn-primary" onClick={() => navigate('/assessment')} style={{ marginTop: '16px' }}>
            Back to Assessments
          </button>
        </div>
      </div>
    );
  }

  const question = assessment.questions[currentIndex];
  const isLastQuestion = currentIndex === assessment.questions.length - 1;
  const hasAnswer = answers[question.id] !== undefined && answers[question.id] !== '';

  return (
    <div className="assessment-focus-mode">
      <div className="assessment-focus-header">
        <button className="btn-secondary" onClick={() => navigate('/assessment')}>Exit</button>
        <h1>{assessment.title}</h1>
        <p className="subtitle">Question {currentIndex + 1} of {assessment.questions.length}</p>
      </div>

      <div className="assessment-box">
        <div className="question-card">
          <p className="question-text">{question.question_text}</p>

          {question.options.length > 0 ? (
            <div className="option-buttons">
              {question.options.map((option) => (
                <button
                  key={option.id}
                  className={answers[question.id] === option.value ? 'btn-primary' : 'btn-secondary'}
                  onClick={() => selectAnswer(question.id, option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : (
            <input
              type="text"
              placeholder="Your answer"
              value={answers[question.id] || ''}
              onChange={(e) => handleTextAnswer(question.id, e.target.value)}
            />
          )}
        </div>

        <div className="card-actions" style={{ marginTop: '16px' }}>
          <button className="btn-secondary" onClick={goBack} disabled={currentIndex === 0}>
            Back
          </button>
          {isLastQuestion ? (
            <button className="btn-primary" onClick={handleFinalSubmit} disabled={!hasAnswer}>
              Submit Assessment
            </button>
          ) : (
            <button className="btn-primary" onClick={goNext} disabled={!hasAnswer}>
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AssessmentView;