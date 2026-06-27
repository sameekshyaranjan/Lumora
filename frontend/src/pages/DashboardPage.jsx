import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuth } from '../redux/authSlice';
import { progressApi, timestampApi } from '../api/endpoints';

export default function DashboardPage() {
  const [resumeCourse, setResumeCourse] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);

  const { status, user } = useSelector(selectAuth);
  const [stats, setStats] = useState({ xp: 0, current_streak: 0 });

  useEffect(() => {
    // Read progress to see if there's a course they are currently taking
    const savedProgress = JSON.parse(localStorage.getItem('lumoraProgress') || '{}');
    const categories = Object.keys(savedProgress);
    if (categories.length > 0) {
      // Pick the first one they started for the "Continue" banner
      const category = categories[0];
      const completedCount = savedProgress[category].length;
      setResumeCourse({
        category,
        completedCount,
        title: `${category} Masterclass`
      });
    }

    if (status === 'authenticated') {
      progressApi.stats().then(res => {
        if (res) setStats({ xp: res.xp, current_streak: res.current_streak });
      }).catch(e => console.error(e));
      
      // Attempt to load resume course from backend using a known category
      progressApi.get('Language').then(res => {
        if (res.completed && res.completed.length > 0) {
          setResumeCourse({
            category: 'Language',
            completedCount: res.completed.length,
            title: `Language Masterclass`
          });
        }
      }).catch(e => {});

      timestampApi.getAllTimestamps().then(res => {
        if (res && res.bookmarks) setBookmarks(res.bookmarks);
      }).catch(e => console.error(e));
    }
  }, [status]);

  const domains = [
    {
      id: 'languages',
      name: 'Language Learning',
      courses: [
        { id: 'german', title: 'Learn German Masterclass', category: 'Language', icon: '🇩🇪', videos: 3 },
        { id: 'spanish', title: 'Spanish for Beginners', category: 'Spanish', icon: '🇪🇸', videos: 0 },
      ]
    },
    {
      id: 'tech',
      name: 'Technology & IT',
      courses: [
        { id: 'frontend', title: 'Frontend Web Development', category: 'Tech', icon: '💻', videos: 12 },
      ]
    },
    {
      id: 'business',
      name: 'Business & Management',
      courses: [
        { id: 'business', title: 'Business Fundamentals', category: 'Business', icon: '📈', videos: 8 },
      ]
    }
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Explore Domains</h1>
          <p>Choose a domain to discover courses and start learning.</p>
        </div>
        
        {status === 'authenticated' && (
          <div className="dashboard-stats">
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '12px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: 'var(--shadow-sm)', flex: 1 }}>
              <div style={{ fontSize: '24px' }}>🔥</div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--fg-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Day Streak</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--fg)' }}>{stats.current_streak}</div>
              </div>
            </div>
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '12px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: 'var(--shadow-sm)', flex: 1 }}>
              <div style={{ fontSize: '24px' }}>⭐</div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--fg-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total XP</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--fg)' }}>{stats.xp}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {resumeCourse && (
        <div className="resume-banner">
          <div>
            <div className="resume-banner-label">Resume Learning</div>
            <h2>{resumeCourse.title}</h2>
            <p>You've completed {resumeCourse.completedCount} episodes.</p>
          </div>
          <Link to={`/course/${resumeCourse.category}`} className="btn-resume">
            Continue →
          </Link>
        </div>
      )}

      {bookmarks.length > 0 && (
        <div className="domain-section" style={{ marginBottom: '48px' }}>
          <h2 className="domain-header">🔖 My Bookmarked Moments</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {bookmarks.map(bm => (
              <Link 
                to={`/course/${bm.category}?videoId=${bm.video_id}&t=${bm.timestamp_seconds}`} 
                key={bm.id}
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '16px', borderRadius: '12px', textDecoration: 'none', color: 'var(--fg)', display: 'block', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)' }}
              >
                <div style={{ fontSize: '13px', color: 'var(--fg-muted)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>{bm.title}</span>
                  <span style={{ background: 'var(--accent-primary)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                    {Math.floor(bm.timestamp_seconds / 60)}:{(bm.timestamp_seconds % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div style={{ fontSize: '15px', fontWeight: 600 }}>{bm.note || 'Saved Timestamp'}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
        {domains.map(domain => (
          <div key={domain.id} className="domain-section">
            <h2 className="domain-header">
              {domain.name}
            </h2>
            <div className="course-grid">
              {domain.courses.map(course => (
                <Link to={`/course/${course.category}`} className="course-card" key={course.id}>
                  <div className="course-icon">{course.icon}</div>
                  <h3 className="course-title">{course.title}</h3>
                  <div className="course-meta">
                    <span>{course.category}</span>
                    <span>{course.videos} lessons</span>
                  </div>
                  <div className="course-action">
                    Start Learning →
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
