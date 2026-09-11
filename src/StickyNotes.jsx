import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const COLORS = ['#fef08a', '#fecaca', '#bbf7d0', '#bfdbfe', '#e9d5ff', '#fed7aa'];

function StickyNotes() {
  const { token } = useAuth();
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  function fetchNotes() {
    fetch(`${import.meta.env.VITE_API_URL}/sticky-notes`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setNotes(data))
      .catch((error) => console.error('Error fetching notes:', error));
  }

  function handleAddNote() {
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    fetch(`${import.meta.env.VITE_API_URL}/sticky-notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ content: '', color: randomColor })
    })
      .then((response) => response.json())
      .then((newNote) => setNotes((prev) => [...prev, newNote]))
      .catch((error) => console.error('Error creating note:', error));
  }

  function handleContentChange(noteId, content) {
    setNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, content } : n)));
  }

  function handleSaveNote(noteId, content, color) {
    fetch(`${import.meta.env.VITE_API_URL}/sticky-notes/${noteId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ content, color })
    }).catch((error) => console.error('Error saving note:', error));
  }

  function handleColorChange(noteId, color) {
    setNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, color } : n)));
    const note = notes.find((n) => n.id === noteId);
    handleSaveNote(noteId, note ? note.content : '', color);
  }

  function handleDelete(noteId) {
    fetch(`${import.meta.env.VITE_API_URL}/sticky-notes/${noteId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => setNotes((prev) => prev.filter((n) => n.id !== noteId)))
      .catch((error) => console.error('Error deleting note:', error));
  }

  return (
    <div className="sticky-notes-panel">
      <div className="sticky-notes-header">
        <h3>Notes</h3>
        <button className="btn-primary" onClick={handleAddNote}>+ Note</button>
      </div>

      {notes.map((note) => (
        <div className="sticky-note" style={{ backgroundColor: note.color }} key={note.id}>
          <textarea
            className="sticky-note-text"
            value={note.content || ''}
            onChange={(e) => handleContentChange(note.id, e.target.value)}
            onBlur={() => handleSaveNote(note.id, note.content, note.color)}
            placeholder="Type a note..."
          />
          <div className="sticky-note-footer">
            <div className="sticky-note-colors">
              {COLORS.map((c) => (
                <button
                  key={c}
                  className="sticky-note-color-dot"
                  style={{ backgroundColor: c, border: c === note.color ? '2px solid #1a1a1a' : '2px solid transparent' }}
                  onClick={() => handleColorChange(note.id, c)}
                />
              ))}
            </div>
            <button className="sticky-note-delete" onClick={() => handleDelete(note.id)}>×</button>
          </div>
        </div>
      ))}
      {notes.length === 0 && <p className="subtitle">No notes yet</p>}
    </div>
  );
}

export default StickyNotes;