import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectAuth, logout } from '../redux/authSlice';

export default function Navbar() {
  const { status, user } = useSelector(selectAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          Lumora
        </Link>
        <div className="navbar-links">
          {status === 'authenticated' ? (
            <>
              <Link to="/courses" className="nav-link">Courses</Link>
              <Link to="/bookmarks" className="nav-link">Saved</Link>
              <Link to="/history" className="nav-link">History</Link>
              <div className="nav-profile">
                <span>{user?.name}</span>
                <button onClick={handleLogout} className="btn-logout">Logout</button>
              </div>
            </>
          ) : (
            <div className="nav-auth">
              <Link to="/login" className="nav-link">Log in</Link>
              <Link to="/register" className="btn-primary">Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
