import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, selectAuth } from '../redux/authSlice';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector(selectAuth);
  const [form, setForm] = useState({ email: '', password: '' });

  const submit = async () => {
    const res = await dispatch(login(form));
    if (login.fulfilled.match(res)) navigate('/');
  };

  return (
    <div className="auth-page">
      <h2>Log in</h2>
      <input placeholder="Email" type="email"
        onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input placeholder="Password" type="password"
        onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button disabled={status === 'loading'} onClick={submit}>
        {status === 'loading' ? 'Logging in…' : 'Log in'}
      </button>
      {error && <p className="error-text">{error}</p>}
      <p className="muted">No account? <Link to="/register">Register</Link></p>
    </div>
  );
}
