import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

function ProjectBoardsView() {
  const { token } = useAuth();
  const [boards, setBoards] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: ''});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBoards();
  }, []);

  function fetchBoards() {
    fetch(`${import.meta.env.VITE_API_URL}/project-boards`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setBoards(data))
      .catch((error) => console.error('Error fetching boards:', error));
  }

  function fetchEventCourses() {
    fetch(`${import.meta.env.VITE_API_URL}/courses?content_type=events`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setCourses(data))
      .catch((error) => console.error('Error fetching event courses:', error));
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    fetch(`${import.meta.env.VITE_API_URL}/project-boards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: formData.title,
        description: formData.description
      })
    })
      .then((response) => response.json())
      .then(() => {
        setFormData({ title: '', description: ''});
        setShowAddForm(false);
        fetchBoards();
      })
      .catch((error) => console.error('Error creating board:', error));
  }

  const filteredBoards = boards.filter((b) =>
    b.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <div className="page-content">
      <header className="app-header">
        <h1>Project Boards</h1>
        <p className="subtitle">Plan and track tasks for events</p>
      </header>

      <div className="add-card">
        <button className="btn-primary" onClick={() => setShowAddForm((prev) => !prev)}>
          {showAddForm ? 'Close' : 'Add Board'}
        </button>

        <input
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', width: '100%', maxWidth: '300px' }}
        />

        {showAddForm && (
          <form className="player-form" onSubmit={handleSubmit}>
            <input name="title" placeholder="Board title" value={formData.title} onChange={handleChange} required />
            <input name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
            <button type="submit" className="btn-primary">Save Board</button>
          </form>
        )}
      </div>

      <div className="player-grid">
        {filteredBoards.map((board) => (
          <Link to={`/project-boards/${board.id}`} className="player-name-link" key={board.id}>
            <div className="player-card">
              <h3>{board.title}</h3>
              <p className="position">{board.description}</p>
            </div>
          </Link>
        ))}
        {boards.length === 0 && <p className="subtitle">No boards yet</p>}
      </div>
    </div>
  );
}

export default ProjectBoardsView;