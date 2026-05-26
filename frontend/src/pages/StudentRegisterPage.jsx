import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const API_BASE_URL = 'http://localhost:8082/api';

export default function StudentRegisterPage() {
  const [mode, setMode] = useState('STUDENT'); // or COLLEGE
  const [isLogin, setIsLogin] = useState(false);
  const [name, setName] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, showToast } = useApp();
  const navigate = useNavigate();
  const { user } = useApp();
  const location = useLocation();

  useEffect(() => {
    setIsLogin(new URLSearchParams(location.search).get('login') === 'true');
  }, [location.search]);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'COLLEGE' ? '/college-dashboard' : '/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? 'login' : 'register';
      const payload = isLogin 
        ? { email, password }
        : {
            role: mode,
            name: mode === 'STUDENT' ? name : '',
            collegeName: mode === 'COLLEGE' ? collegeName : '',
            email,
            password,
          };

      const res = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        const message = data?.error || data?.message || `Registration failed (${res.status})`;
        console.error('register failed', res.status, data);
        showToast(message, 'error');
        return;
      }

      if (data.token) {
        login({ token: data.token, user: data.user });
        showToast(isLogin ? 'Welcome back!' : 'Registration successful', 'success');
        navigate(data.user?.role === 'COLLEGE' ? '/college-dashboard' : '/dashboard');
      } else {
        // fallback
        if (mode === 'STUDENT') login({ name: name || 'Student', email, role: 'STUDENT' });
        else login({ name: collegeName || 'College Admin', email, role: 'COLLEGE' });
        showToast(isLogin ? 'Welcome back!' : 'Registration successful', 'success');
        navigate(mode === 'STUDENT' ? '/dashboard' : '/college-dashboard');
      }
    } catch (err) {
      console.error(err);
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        showToast('Could not connect to the server. Is the backend running on port 8082?', 'error');
        return;
      }
      showToast('Authentication failed (server error)', 'error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: 'calc(var(--nav-height) + 40px)', paddingBottom: 60, background: 'var(--surface-2)' }}>
      <div className="container" style={{ maxWidth: 560 }}>
        <div className="card" style={{ padding: 24 }}>
          {!isLogin && ( // Only show role selection for registration
            <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
              <button onClick={() => setMode('STUDENT')} className={`btn ${mode === 'STUDENT' ? 'btn-primary' : 'btn-ghost'}`}>Student</button>
              <button onClick={() => setMode('COLLEGE')} className={`btn ${mode === 'COLLEGE' ? 'btn-primary' : 'btn-ghost'}`}>College</button>
            </div>
          )}

          <div style={{ marginBottom: 18 }}>
            <div className="section-tag">{isLogin ? 'Authentication' : (mode === 'STUDENT' ? 'Student' : 'College') + ' Portal'}</div>
            <h1 className="section-title" style={{ marginBottom: 8 }}>{isLogin ? 'Welcome back' : 'Create account'}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {isLogin 
                ? 'Login to access your dashboard and manage applications.' 
                : 'Join our platform to explore and apply to the best colleges across India.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
            {!isLogin && (
              mode === 'STUDENT' ? (
              <label>
                Full Name
                <input value={name} onChange={(e) => setName(e.target.value)} required className="form-input" placeholder="Your full name" style={{ marginTop: 8 }} />
              </label>
            ) : (
              <label>
                College Name
                <input value={collegeName} onChange={(e) => setCollegeName(e.target.value)} required className="form-input" placeholder="College / Institution name" style={{ marginTop: 8 }} />
              </label>
            ))}

            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="form-input" placeholder="contact@example.com" style={{ marginTop: 8 }} />
            </label>

            <label>
              Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="form-input" placeholder={isLogin ? "Enter your password" : "Create a password"} style={{ marginTop: 8 }} />
            </label>

            <button type="submit" className="btn btn-primary">{isLogin ? 'Login' : 'Create Account'}</button>
          </form>
          
          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"} 
            <span onClick={() => setIsLogin(!isLogin)} style={{ color: 'var(--accent)', cursor: 'pointer', marginLeft: 6, fontWeight: 600 }} role="button" tabIndex="0">
              {isLogin ? 'Register now' : 'Login here'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
