import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { videoApi } from '../api/endpoints';
import useWatchHistory from '../hooks/useWatchHistory';

export default function DashboardPage() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const { watched } = useWatchHistory();

  useEffect(() => {
    // Fetch all videos in the curriculum
    videoApi.list({ limit: 10 }).then((data) => {
      // Assuming 'Language' is our German course category
      const curriculum = data.videos.filter(v => v.category === 'Language');
      // Sort to ensure sequential order: Introduction -> Learning -> Story
      const ordered = curriculum.sort((a, b) => a.title.localeCompare(b.title));
      setLessons(ordered);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><div className="loading-more">Loading dashboard...</div></div>;

  // Calculate progress
  const watchedLessons = lessons.filter(l => watched.some(w => w.id === l.id));
  const progressPct = lessons.length ? Math.round((watchedLessons.length / lessons.length) * 100) : 0;
  
  // Determine next lesson to watch
  const nextLesson = lessons.find(l => !watched.some(w => w.id === l.id)) || lessons[0];

  return (
    <div className="page dashboard-page">
      <h2>My Learning</h2>
      
      <div className="hero-course-card">
        <div className="hero-course-bg"></div>
        <div className="hero-course-content">
          <span className="course-cat">Masterclass</span>
          <h1>German Mastery Curriculum</h1>
          <p>Master the German language from the ground up through 3 highly focused, sequential video lessons. You'll learn basics, grammar, and listening comprehension.</p>
          
          <div className="course-progress-section">
            <div className="progress-labels">
              <span>{watchedLessons.length} of {lessons.length} lessons completed</span>
              <span>{progressPct}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressPct}%` }}></div>
            </div>
          </div>

          <div className="hero-actions">
            {nextLesson && (
              <Link to={`/course/german/lesson/${nextLesson.id}`} className="btn-primary btn-large">
                {progressPct === 0 ? 'Start Course' : progressPct === 100 ? 'Review Course' : 'Resume Course'}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
