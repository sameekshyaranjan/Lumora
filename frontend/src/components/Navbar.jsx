import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectAuth, logout } from '../redux/authSlice';

export default function Navbar() {
  const { status } = useSelector(selectAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
  };

  // Hide navbar in the player for immersion, or show it? Let's show it so they can always navigate out.
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={status === 'authenticated' ? '/explore' : '/'} className="navbar-brand">
          Lumora
        </Link>
        
        <div className="nav-links">
          {status === 'authenticated' ? (
            <>
              <Link to="/explore" className="nav-link">Explore</Link>
              <button onClick={handleLogout} className="btn-secondary" style={{ padding: '10px 20px', fontSize: '14px' }}>
                Log out
              </button>
            </>
          ) : (
            <>
              {location.pathname !== '/login' && <Link to="/login" className="nav-link">Log in</Link>}
              {location.pathname !== '/register' && <Link to="/register" className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>Sign up</Link>}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
