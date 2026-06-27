import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { videoApi } from '../api/endpoints';

export default function CoursePlayerPage() {
  const { category } = useParams();
  
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [completedVideos, setCompletedVideos] = useState([]);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [likedVideos, setLikedVideos] = useState({});
  
  const containerRef = useRef(null);
  const videoRefs = useRef([]);

  useEffect(() => {
    // Load progress from local storage
    const savedProgress = JSON.parse(localStorage.getItem('lumoraProgress') || '{}');
    if (savedProgress[category]) {
      setCompletedVideos(savedProgress[category]);
    } else {
      setCompletedVideos([]);
    }

    const fetchVideos = async () => {
      try {
        const res = await videoApi.list({ limit: 20, category: category === 'all' ? undefined : category });
        setVideos(res.videos || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [category]);

  const handleIntersection = useCallback((entries) => {
    entries.forEach(entry => {
      const idx = parseInt(entry.target.dataset.index, 10);
      if (entry.isIntersecting) {
        setCurrentIndex(idx);
        if (videoRefs.current[idx]) {
          videoRefs.current[idx].play().catch(() => {});
        }
      } else {
        if (videoRefs.current[idx]) {
          videoRefs.current[idx].pause();
        }
      }
    });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, { threshold: 0.6 });
    setTimeout(() => {
      if (containerRef.current) {
        const children = Array.from(containerRef.current.children);
        children.forEach(child => observer.observe(child));
      }
    }, 500);
    return () => observer.disconnect();
  }, [videos.length, handleIntersection]);

  const markCompleted = (videoId, index) => {
    if (!completedVideos.includes(videoId)) {
      setCompletedVideos(prev => {
        if (prev.includes(videoId)) return prev;
        const newProgress = [...prev, videoId];
        
        const allProgress = JSON.parse(localStorage.getItem('lumoraProgress') || '{}');
        allProgress[category] = newProgress;
        localStorage.setItem('lumoraProgress', JSON.stringify(allProgress));
        return newProgress;
      });
      
      // Only auto-scroll if it's naturally ending and it's the current video
      if (index === currentIndex && index < videos.length - 1) {
        const el = document.querySelector(`[data-index="${index + 1}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleTimeUpdate = (e, videoId, index) => {
    const videoElement = e.target;
    if (!videoElement.duration) return;
    const progress = videoElement.currentTime / videoElement.duration;
    // Mark complete at 90% watched to ensure it fires reliably
    if (progress > 0.9 && !completedVideos.includes(videoId)) {
      markCompleted(videoId, index);
    }
  };

  const toggleLike = (videoId) => {
    setLikedVideos(prev => ({ ...prev, [videoId]: !prev[videoId] }));
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading course content...</div>;
  
  if (videos.length === 0) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center' }}>
        <h2>Course not found or empty</h2>
        <Link to="/explore" className="btn-primary">Return to Explore</Link>
      </div>
    );
  }

  const progressPercent = Math.round((completedVideos.length / videos.length) * 100);

  return (
    <div className="player-layout" style={{ position: 'relative' }}>
      {/* Mobile Sidebar Toggle & Overlay */}
      <div className="mobile-sidebar-toggle" onClick={() => setSidebarOpen(true)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </div>
      {sidebarOpen && <div className="mobile-sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* Feedback Modal */}
      {feedbackOpen && (
        <div className="feedback-modal-overlay" onClick={() => setFeedbackOpen(false)}>
          <div className="feedback-modal" onClick={e => e.stopPropagation()}>
            <h3>Send Feedback</h3>
            <textarea placeholder="Was this episode helpful? Let us know..."></textarea>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setFeedbackOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setFeedbackOpen(false)}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Curriculum */}
      <div className={`player-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="player-sidebar-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Link to="/explore" style={{ fontSize: '14px', color: 'var(--fg-muted)' }}>
              ← Back to Explore
            </Link>
            <button className="mobile-sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
          </div>
          <h2>{category} Masterclass</h2>
        </div>
        
        <div className="course-global-progress">
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
            <span>Course Progress</span>
            <span style={{ color: 'var(--accent-primary)' }}>{progressPercent}%</span>
          </div>
          <div className="course-global-progress-bar">
            <div className="course-global-progress-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        <div className="player-sidebar-list">
          {videos.map((video, idx) => {
            const isCompleted = completedVideos.includes(video.id);
            const isActive = idx === currentIndex;
            // Simple logic: locked if previous is not completed (except the first one)
            const isLocked = idx > 0 && !completedVideos.includes(videos[idx - 1].id);
            
            return (
              <div 
                key={video.id} 
                className={`lesson-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                onClick={() => {
                  if (isLocked) return;
                  const el = document.querySelector(`[data-index="${idx}"]`);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  setSidebarOpen(false);
                }}
              >
                <div className="lesson-status-icon">
                  {isActive ? '▶️' : isCompleted ? '✅' : isLocked ? '🔒' : '○'}
                </div>
                <div className="lesson-meta-wrap">
                  <div className="lesson-ep-label">Episode {idx + 1}</div>
                  <div className="lesson-title">{video.title}</div>
                  <div className="lesson-desc">{video.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Scrolling Feed */}
      <div className="player-main">
        <div className="scroll-feed-container" ref={containerRef}>
          {videos.map((video, index) => {
            const videoUrl = `${import.meta.env.VITE_API_URL}${video.file_path}`;
            const isLiked = likedVideos[video.id];

            return (
              <div key={video.id} className="feed-video-wrapper" data-index={index}>
                <video 
                  ref={el => videoRefs.current[index] = el}
                  src={videoUrl}
                  className="feed-video"
                  playsInline
                  crossOrigin="anonymous"
                  controls
                  controlsList="nodownload"
                  onTimeUpdate={(e) => handleTimeUpdate(e, video.id, index)}
                  onEnded={() => markCompleted(video.id, index)}
                ></video>

                <div className="player-actions">
                  <div 
                    className={`player-action-btn ${isLiked ? 'active' : ''}`} 
                    title="Like"
                    onClick={() => toggleLike(video.id)}
                  >
                    {isLiked ? '❤️' : '🤍'}
                  </div>
                  <div className="player-action-btn" title="Feedback" onClick={() => setFeedbackOpen(true)}>💬</div>
                  <div className="player-action-btn" title="Bookmark">🔖</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
