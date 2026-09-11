import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

const STATUSES = [
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'done', label: 'Done' }
];

function ProjectBoardDetailView() {
  const { boardId } = useParams();
  const { token } = useAuth();
  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [players, setPlayers] = useState([]);
  const [view, setView] = useState('list');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', assigned_to: '', due_date: '', status: 'todo' });

  useEffect(() => {
    fetchBoard();
    fetchTasks();
    fetchAdmins();
  }, [boardId]);

  function fetchBoard() {
    fetch(`${import.meta.env.VITE_API_URL}/project-boards/${boardId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setBoard(data))
      .catch((error) => console.error('Error fetching board:', error));
  }

  function fetchTasks() {
    fetch(`${import.meta.env.VITE_API_URL}/project-boards/${boardId}/tasks`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setTasks(data))
      .catch((error) => console.error('Error fetching tasks:', error));
  }

  function fetchAdmins() {
    fetch(`${import.meta.env.VITE_API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setPlayers(data.filter((u) => u.role === 'admin')))
      .catch((error) => console.error('Error fetching admins:', error));
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    fetch(`${import.meta.env.VITE_API_URL}/project-boards/${boardId}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: formData.title,
        description: formData.description,
        assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : null,
        due_date: formData.due_date || null,
        status: formData.status
      })
    })
      .then((response) => response.json())
      .then(() => {
        setFormData({ title: '', description: '', assigned_to: '', due_date: '', status: 'todo' });
        setShowAddForm(false);
        fetchTasks();
      })
      .catch((error) => console.error('Error creating task:', error));
  }

  function updateTaskStatus(taskId, newStatus) {
    fetch(`${import.meta.env.VITE_API_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    })
      .then(() => fetchTasks())
      .catch((error) => console.error('Error updating task:', error));
  }

  function handleDelete(taskId) {
    fetch(`${import.meta.env.VITE_API_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchTasks())
      .catch((error) => console.error('Error deleting task:', error));
  }

  function assigneeName(userId) {
    const found = players.find((p) => p.id === userId);
    return found ? found.name : 'Unassigned';
  }

  if (!board) {
    return <div className="page-content"><p>Loading board...</p></div>;
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date) - new Date(b.due_date);
  });

  return (
    <div className="page-content">
      <Link to="/project-boards" className="back-link">← Back to Boards</Link>
      <header className="app-header">
        <h1>{board.title}</h1>
        <p className="subtitle">{board.description}</p>
      </header>

      <div className="unit-tabs">
        <button className={view === 'list' ? 'btn-primary' : 'btn-secondary'} onClick={() => setView('list')}>List</button>
        <button className={view === 'board' ? 'btn-primary' : 'btn-secondary'} onClick={() => setView('board')}>Board</button>
      </div>

      <div className="add-card">
        <button className="btn-primary" onClick={() => setShowAddForm((prev) => !prev)}>
          {showAddForm ? 'Close' : 'Add Task'}
        </button>

        {showAddForm && (
          <form className="player-form" onSubmit={handleSubmit}>
            <input name="title" placeholder="Task title" value={formData.title} onChange={handleChange} required />
            <input name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
            <select name="assigned_to" value={formData.assigned_to} onChange={handleChange}>
              <option value="">Unassigned</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input name="due_date" type="datetime-local" value={formData.due_date} onChange={handleChange} />
            <select name="status" value={formData.status} onChange={handleChange}>
              {STATUSES.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
            <button type="submit" className="btn-primary">Save Task</button>
          </form>
        )}
      </div>

      {view === 'list' ? (
        <div className="chart-box">
          {sortedTasks.length === 0 ? (
            <p className="subtitle">No tasks yet</p>
          ) : (
            sortedTasks.map((task) => (
              <div className="question-card" key={task.id}>
                <p className={task.status === 'done' ? 'question-text' : 'question-text'} style={task.status === 'done' ? { textDecoration: 'line-through', color: 'var(--text-muted, #9ca3af)' } : {}}>
                  {task.title}
                </p>
                <p className="subtitle">
                  {assigneeName(task.assigned_to)}
                  {task.due_date && ` — Due ${new Date(task.due_date).toLocaleString()}`}
                </p>
                <div className="option-buttons" style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {STATUSES.map((s) => (
                    <button
                      key={s.key}
                      className={task.status === s.key ? 'btn-primary' : 'btn-secondary'}
                      onClick={() => updateTaskStatus(task.id, s.key)}
                    >
                      {s.label}
                    </button>
                  ))}
                  <button className="btn-danger" onClick={() => handleDelete(task.id)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {STATUSES.map((column) => (
            <div className="chart-box" key={column.key}>
              <h3>{column.label}</h3>
              {tasks.filter((t) => t.status === column.key).map((task) => (
                <div className="mini-proficiency" key={task.id}>
                  <p className="level" style={{ fontWeight: 600 }}>{task.title}</p>
                  <p className="level">{assigneeName(task.assigned_to)}</p>
                  {task.due_date && <p className="level">{new Date(task.due_date).toLocaleDateString()}</p>}
                  <div className="option-buttons" style={{ flexDirection: 'row', marginTop: '8px' }}>
                    {STATUSES.filter((s) => s.key !== column.key).map((s) => (
                      <button key={s.key} className="btn-secondary" onClick={() => updateTaskStatus(task.id, s.key)}>
                        Move to {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {tasks.filter((t) => t.status === column.key).length === 0 && (
                <p className="subtitle">Nothing here</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectBoardDetailView;