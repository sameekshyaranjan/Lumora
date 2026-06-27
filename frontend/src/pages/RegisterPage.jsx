import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, selectAuth } from '../redux/authSlice';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector(selectAuth);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const submit = async () => {
    const res = await dispatch(register(form));
    if (register.fulfilled.match(res)) navigate('/');
  };

  return (
    <div className="auth-page">
      <h2>Create account</h2>
      <input placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Email" type="email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input placeholder="Password (8+ chars)" type="password"
        onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button disabled={status === 'loading'} onClick={submit}>
        {status === 'loading' ? 'Creating…' : 'Register'}
      </button>
      {error && <p className="error-text">{error}</p>}
      <p className="muted">Have an account? <Link to="/login">Log in</Link></p>
    </div>
  );
}
