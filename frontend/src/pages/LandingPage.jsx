import { Link, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuth } from '../redux/authSlice';

export default function LandingPage() {
  const { status } = useSelector(selectAuth);

  if (status === 'authenticated') {
    return <Navigate to="/explore" replace />;
  }

  return (
    <div className="landing-hero">
      <div className="landing-content">
        <h1 className="gradient-text">Learn anything, <br />by scrolling.</h1>
        <p>
          Welcome to the next generation of online learning. 
          Discover expert-led courses and absorb knowledge effortlessly 
          through our immersive vertical video player.
        </p>
        <div className="actions" style={{ display: 'flex', gap: '16px' }}>
          <Link to="/register" className="btn-primary" style={{ padding: '16px 32px', fontSize: '16px' }}>
            Get Started
          </Link>
          <Link to="/explore" className="btn-secondary" style={{ padding: '16px 32px', fontSize: '16px' }}>
            View Courses
          </Link>
        </div>
      </div>

      <div className="landing-auth-box">
        <h2 style={{ marginBottom: '8px', fontSize: '24px' }}>Ready to learn?</h2>
        <p className="muted" style={{ marginBottom: '24px' }}>Create an account or log in to continue.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link to="/login" className="btn-secondary" style={{ textAlign: 'center' }}>
            Log in to your account
          </Link>
          <Link to="/register" className="btn-primary" style={{ textAlign: 'center' }}>
            Create a new account
          </Link>
        </div>
      </div>
    </div>
  );
}
