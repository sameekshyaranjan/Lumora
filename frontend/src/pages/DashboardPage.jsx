import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const [resumeCourse, setResumeCourse] = useState(null);

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
  }, []);

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
        <h1>Explore Domains</h1>
        <p>Choose a domain to discover courses and start learning.</p>
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
