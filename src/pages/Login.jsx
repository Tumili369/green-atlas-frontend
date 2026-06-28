import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const BASE = import.meta.env.VITE_API_URL;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [tab,   setTab]   = useState('login'); // login | register | admin
  const [form,  setForm]  = useState({ username: '', password: '', setupKey: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError(''); setLoading(true);
    try {
      let res;
      if (tab === 'login')    res = await axios.post(`${BASE}/auth/login`,          { username: form.username, password: form.password });
      if (tab === 'register') res = await axios.post(`${BASE}/auth/register`,       { username: form.username, password: form.password });
      if (tab === 'admin')    res = await axios.post(`${BASE}/auth/register-admin`, { username: form.username, password: form.password, setupKey: form.setupKey });
      login(res.data);
      navigate(res.data.role === 'admin' ? '/admin' : '/explore');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page page-enter">
      <div className="login-card">
        <div className="login-brand">
          <span>🌿</span>
          <h1>Green<em>Atlas</em></h1>
        </div>
        <p className="login-sub">Campus Tree Identification System</p>

        <div className="login-tabs">
          <button className={tab === 'login'    ? 'active' : ''} onClick={() => setTab('login')}>Sign in</button>
          <button className={tab === 'register' ? 'active' : ''} onClick={() => setTab('register')}>Register</button>
          <button className={tab === 'admin'    ? 'active' : ''} onClick={() => setTab('admin')}>Admin setup</button>
        </div>

        <div className="login-form">
          <label>Username</label>
          <input type="text" placeholder="Enter username" value={form.username} onChange={e => set('username', e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />

          <label>Password</label>
          <input type="password" placeholder="Enter password" value={form.password} onChange={e => set('password', e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />

          {tab === 'admin' && (
            <>
              <label>Admin Setup Key</label>
              <input type="text" placeholder="Enter setup key from .env" value={form.setupKey} onChange={e => set('setupKey', e.target.value)} />
              <p className="setup-note">The setup key is the value of <code>ADMIN_SETUP_KEY</code> in your backend .env file.</p>
            </>
          )}

          {error && <div className="login-error">{error}</div>}

          <button className="login-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Please wait…' : tab === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </div>

        <Link to="/" className="login-back">← Back to home</Link>
      </div>
    </div>
  );
}
