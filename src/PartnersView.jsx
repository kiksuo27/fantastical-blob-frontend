import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function PartnersView() {
  const { token, currentUser } = useAuth();
  const [categories, setCategories] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [allPartners, setAllPartners] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
  fetchCategories();
}, []);

const searchIndex = [
  ...categories.map((c) => ({ type: 'Category', label: c.name, path: `/partners/${c.id}` })),
  ...allPartners.map((p) => ({ type: 'Partner', label: p.name, path: `/partners/detail/${p.id}` }))
];

const searchResults = searchQuery.trim().length >= 1
  ? searchIndex.filter((item) => item.label.toLowerCase().includes(searchQuery.trim().toLowerCase()))
  : [];

function handleSearchSelect(path) {
  setSearchQuery('');
  setShowSearchResults(false);
  navigate(path);
}

function fetchCategories() {
  fetch(`${import.meta.env.VITE_API_URL}/partner-categories`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then((response) => response.json())
    .then((data) => {
      setCategories(data);
      fetchAllPartners(data);
    })
    .catch((error) => console.error('Error fetching categories:', error));
}

function fetchAllPartners(categoryList) {
  Promise.all(
    categoryList.map((cat) =>
      fetch(`${import.meta.env.VITE_API_URL}/partner-categories/${cat.id}/partners`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then((response) => response.json())
    )
  ).then((results) => {
    setAllPartners(results.flat());
  });
}

  function handleSubmit(event) {
    event.preventDefault();

    fetch(`${import.meta.env.VITE_API_URL}/partner-categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name: categoryName })
    })
      .then((response) => response.json())
      .then(() => {
        setCategoryName('');
        setShowAddForm(false);
        fetchCategories();
      })
      .catch((error) => console.error('Error creating category:', error));
  }

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <div className="page-content">
      <header className="app-header">
        <h1>Partners</h1>
        <p className="subtitle">Community, employer, and donor partners</p>
      </header>

      {currentUser?.role === 'admin' && (
        <div className="add-card">
          <button className="btn-primary" onClick={() => setShowAddForm((prev) => !prev)}>
            {showAddForm ? 'Close' : 'Add Category'}
          </button>
          
          <div style={{ position: 'relative', marginTop: '12px', maxWidth: '300px' }}>
            <input
              type="text"
              placeholder="Search categories and partners..."
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
          
          {showAddForm && (
            <form className="player-form" onSubmit={handleSubmit}>
              <input
                placeholder="Category name (e.g. Local Sponsors)"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary">Create Category</button>
            </form>
          )}
        </div>
      )}

      <div className="player-grid">
        {filteredCategories.map((category) => (
          <Link to={`/partners/${category.id}`} className="player-name-link" key={category.id}>
            <div className="player-card">
              <h3>{category.name}</h3>
            </div>
          </Link>
        ))}
        {categories.length === 0 && <p className="subtitle">No categories yet</p>}
      </div>
    </div>
  );
}

export default PartnersView;