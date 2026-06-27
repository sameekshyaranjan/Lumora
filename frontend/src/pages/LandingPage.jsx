import { Link, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuth } from '../redux/authSlice';

export default function LandingPage() {
  const { status } = useSelector(selectAuth);

  // If already logged in, skip the landing page and go to courses
  if (status === 'authenticated') {
    return <Navigate to="/courses" replace />;
  }

  return (
    <div className="landing-page">
      <div className="hero-section">
        <h1>Micro-learning for the Modern World</h1>
        <p>Master complex topics through bite-sized, immersive vertical videos. Learn anywhere, anytime, one short at a time.</p>
        <div className="hero-actions">
          <Link to="/register" className="btn-primary btn-large">Start Learning for Free</Link>
          <Link to="/login" className="btn-secondary btn-large">Log In</Link>
        </div>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">📱</div>
          <h3>Vertical Feed</h3>
          <p>TikTok-style immersive learning. Scroll through carefully curated educational shorts tailored to your interests.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔖</div>
          <h3>Saved Learning</h3>
          <p>Bookmark the most impactful videos. Build your own personal library of knowledge to review whenever you need it.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📈</div>
          <h3>Progress Tracking</h3>
          <p>We automatically track your watch history and mark courses as completed. Never lose your place again.</p>
        </div>
      </div>
    </div>
  );
}
