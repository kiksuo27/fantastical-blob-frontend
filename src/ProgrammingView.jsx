import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function ProgrammingView({ contentType, pageTitle }) {
  const { token, currentUser } = useAuth();
  const [courses, setCourses] = useState([]);
  const [players, setPlayers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showAddCourseForm, setShowAddCourseForm] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_public: false,
    assignmentType: 'position',
    assignmentValue: ''
  });

  useEffect(() => {
    fetchCourses();
    if (currentUser?.role === 'admin') {
      fetchPlayers();
      fetchGroups();
    }
  }, [currentUser]);

  const searchIndex = courses.flatMap((course) => [
    { type: 'Course', label: course.title, path: `/programming/${course.id}` },
    ...course.modules.map((module) => ({
      type: 'Module',
      label: `${module.title} (${course.title})`,
      path: `/programming/${course.id}/modules/${module.id}`
    }))
  ]);

  const searchResults = searchQuery.trim().length >= 1
    ? searchIndex.filter((item) => item.label.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : [];

  function handleSearchSelect(path) {
    setSearchQuery('');
    setShowSearchResults(false);
    navigate(path);
  }

  function fetchCourses() {
    fetch(`${import.meta.env.VITE_API_URL}/courses?content_type=${contentType}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setCourses(data))
      .catch((error) => console.error('Error fetching courses:', error));
  }

  function fetchPlayers() {
    fetch(`${import.meta.env.VITE_API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setPlayers(data))
      .catch((error) => console.error('Error fetching players:', error));
  }

  function fetchGroups() {
    fetch(`${import.meta.env.VITE_API_URL}/groups`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setGroups(data))
      .catch((error) => console.error('Error fetching groups:', error));
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const assignments = [];
    if (!formData.is_public && formData.assignmentValue) {
      assignments.push({ assignment_type: formData.assignmentType, value: formData.assignmentValue });
    }

    fetch(`${import.meta.env.VITE_API_URL}/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: formData.title,
        description: formData.description,
        is_public: formData.is_public,
        content_type: contentType,
        assignments
      })
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.detail || 'Failed to create course');
          });
        }
        return response.json();
      })
      .then(() => {
        setFormData({ title: '', description: '', is_public: false, assignmentType: 'position', assignmentValue: '' });
        setShowAddCourseForm(false);
        fetchCourses();
      })
      .catch((error) => alert(error.message));
  }

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <div className="page-content">
      <header className="app-header">
        <h1>{pageTitle}</h1>
        <p className="subtitle">Courses and materials</p>
      </header>

      {currentUser?.role === 'admin' && (
        <div className="add-card">
          <button className="btn-primary" onClick={() => setShowAddCourseForm((prev) => !prev)}>
            {showAddCourseForm ? 'Close' : 'Add Course'}
          </button>

          <div style={{ position: 'relative', marginTop: '12px', maxWidth: '300px' }}>
            <input
              type="text"
              placeholder="Search courses and modules..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowSearchResults(true); }}
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', width: '100%' }}
            />

          {showSearchResults && searchQuery.trim() && (
            <div className="search-results">
              {searchResults.length === 0 ? (
                <p className="subtitle" style={{ padding: '12px' }}>No results found</p>
              ) : (
                searchResults.map((r, index) => (
                  <div key={index} className="search-result-item" onClick={() => handleSearchSelect(r.path)}>
                    <span className="search-result-type">{r.type}</span>
                    <span className="search-result-title">{r.label}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

          {showAddCourseForm && (
            <form className="player-form" onSubmit={handleSubmit}>
              <input name="title" placeholder="Course title" value={formData.title} onChange={handleChange} required />
              <input name="description" placeholder="Description" value={formData.description} onChange={handleChange} />

              <label className="checkbox-label">
                <input type="checkbox" name="is_public" checked={formData.is_public} onChange={handleChange} />
                Visible to everyone
              </label>

              {!formData.is_public && (
                <>
                  <select name="assignmentType" value={formData.assignmentType} onChange={handleChange}>
                    <option value="position">Position</option>
                    <option value="unit">Unit (offense/defense/special_teams)</option>
                    <option value="year">Year</option>
                    <option value="group">Custom Group</option>
                    <option value="user">Individual Player</option>
                  </select>

                  {formData.assignmentType === 'group' ? (
                    <select name="assignmentValue" value={formData.assignmentValue} onChange={handleChange}>
                      <option value="">Select a group</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  ) : formData.assignmentType === 'user' ? (
                    <select name="assignmentValue" value={formData.assignmentValue} onChange={handleChange}>
                      <option value="">Select a player</option>
                      {players.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      name="assignmentValue"
                      placeholder={
                        formData.assignmentType === 'unit' ? 'offense / defense / special_teams' : formData.assignmentType
                      }
                      value={formData.assignmentValue}
                      onChange={handleChange}
                    />
                  )}
                </>
              )}

              <button type="submit" className="btn-primary">Save Course</button>
            </form>
          )}
        </div>
      )}

      <div className="player-grid">
        {filteredCourses.map((course) => (
          <Link to={`/${contentType === 'events' ? 'events' : 'programming'}/${course.id}`} className="player-name-link" key={course.id}>
            <div className="player-card">
              <h3>{course.title}</h3>
              <p className="position">{course.description}</p>
              <p className="year">{course.modules.length} module{course.modules.length !== 1 ? 's' : ''}</p>
              {course.is_public && <div className="jersey-badge">Team-wide</div>}
            </div>
          </Link>
        ))}
        {courses.length === 0 && <p className="subtitle">No courses yet</p>}
      </div>
    </div>
  );
}

export default ProgrammingView;