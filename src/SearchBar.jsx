import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function SearchBar() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      fetch(`${import.meta.env.VITE_API_URL}/search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((response) => response.json())
        .then((data) => {
          setResults(data);
          setShowResults(true);
        })
        .catch((error) => console.error('Error searching:', error));
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  function handleSelect(result) {
    setQuery('');
    setResults([]);
    setShowResults(false);
    navigate(result.path);
  }

  return (
    <div className="search-bar-wrapper" ref={wrapperRef}>
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.length >= 2 && setShowResults(true)}
        className="search-input"
      />

      {showResults && (
        <div className="search-results">
          {results.length === 0 ? (
            <p className="subtitle" style={{ padding: '12px' }}>No results found</p>
          ) : (
            results.map((r, index) => (
              <div key={index} className="search-result-item" onClick={() => handleSelect(r)}>
                <span className="search-result-type">{r.type}</span>
                <span className="search-result-title">{r.title}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;