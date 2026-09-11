import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (token) {
      fetch(`${import.meta.env.VITE_API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((response) => {
          if (!response.ok) throw new Error('Invalid token');
          return response.json();
        })
        .then((data) => setCurrentUser(data))
        .catch(() => {
          setToken(null);
          setCurrentUser(null);
          localStorage.removeItem('token');
        });
    }
  }, [token]);

  function login(newToken) {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}