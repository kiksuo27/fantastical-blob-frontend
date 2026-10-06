import { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('login'); // 'login' or 'claim'

  function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const endpoint = mode === 'login' ? '/login' : '/claim-account';

    fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.detail || 'Something went wrong');
          });
        }
        return response.json();
      })
      .then((data) => {
        login(data.access_token);
        navigate ('/');
      })
      .catch((err) => setError(err.message));
  }

  return (
      <div className="auth-box">
        <img
          src="/DevonshireAthletics.png"
          alt="DevonshireAthletics"
          style={{ display: 'block', margin: '0 auto 16px', maxWidth: '200px', height: 'auto' }}
        />
        <h2>{mode === 'login' ? 'Log In' : 'Set Up Your Account'}</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      <div style={{ position: 'relative' }}>
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', paddingRight: '40px' }}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            color: '#6b7280'
          }}
        >
          👁️
        </button>
      </div>
        <button type="submit" className="btn-primary">
          {mode === 'login' ? 'Log In' : 'Set Password'}
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      <p className="toggle-mode">
        {mode === 'login' ? (
          <>First time? <button onClick={() => setMode('claim')}>Set up your account</button></>
        ) : (
          <>Already set up? <button onClick={() => setMode('login')}>Log in</button></>
        )}
      </p>
    </div>
  );
}

export default Login;
