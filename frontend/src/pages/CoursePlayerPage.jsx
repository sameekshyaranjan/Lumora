import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { videoApi, progressApi, quizApi, timestampApi } from '../api/endpoints';
import { useSelector } from 'react-redux';
import { selectAuth } from '../redux/authSlice';
import Hls from 'hls.js';
import CommentSheet from '../components/CommentSheet';

const HLSVideoPlayer = ({ src, startTime, onTimeUpdate, onEnded, videoRef }) => {
  const localRef = useRef(null);
  
  useEffect(() => {
    if (videoRef) {
      if (typeof videoRef === 'function') {
        videoRef(localRef.current);
      } else {
        videoRef.current = localRef.current;
      }
    }
  }, [videoRef]);

  useEffect(() => {
    let hls;
    const video = localRef.current;

    const handleLoadedMetadata = () => {
      if (startTime > 0) video.currentTime = startTime;
    };
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    if (src.endsWith('.m3u8')) {
      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      }
    } else {
      video.src = src;
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      if (hls) hls.destroy();
    };
  }, [src, startTime]);

  return (
    <video
      ref={localRef}
      className="feed-video"
      playsInline
      crossOrigin="anonymous"
      controls
      controlsList="nodownload"
      onTimeUpdate={onTimeUpdate}
      onEnded={onEnded}
    />
  );
};

export default function CoursePlayerPage() {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const targetVideoId = searchParams.get('videoId');
  const targetTime = searchParams.get('t');
  
  const { status } = useSelector(selectAuth);
  
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [completedVideos, setCompletedVideos] = useState([]);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [likedVideos, setLikedVideos] = useState({});
  const [activeCommentVideoId, setActiveCommentVideoId] = useState(null);

  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  
  const containerRef = useRef(null);
  const videoRefs = useRef([]);

  useEffect(() => {
    const fetchProgress = async () => {
      if (status === 'authenticated') {
        try {
          const res = await progressApi.get(category);
          setCompletedVideos(res.completed || []);
        } catch (e) {
          console.error('Failed to fetch progress', e);
        }
      } else {
        const savedProgress = JSON.parse(localStorage.getItem('lumoraProgress') || '{}');
        if (savedProgress[category]) {
          setCompletedVideos(savedProgress[category]);
        } else {
          setCompletedVideos([]);
        }
      }
    };
    fetchProgress();

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
  }, [category, status]);

  useEffect(() => {
    if (videos.length > 0 && targetVideoId) {
      const idx = videos.findIndex(v => v.id === targetVideoId);
      if (idx !== -1) {
        setTimeout(() => {
          const el = document.querySelector(`[data-index="${idx}"]`);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 500);
      }
    }
  }, [videos, targetVideoId]);

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

  const markCompleted = async (videoId, index) => {
    if (!completedVideos.includes(videoId)) {
      setCompletedVideos(prev => {
        if (prev.includes(videoId)) return prev;
        const newProgress = [...prev, videoId];
        
        if (status !== 'authenticated') {
          const allProgress = JSON.parse(localStorage.getItem('lumoraProgress') || '{}');
          allProgress[category] = newProgress;
          localStorage.setItem('lumoraProgress', JSON.stringify(allProgress));
        }
        return newProgress;
      });

      if (status === 'authenticated') {
        try {
          await progressApi.markCompleted(videoId, category);
        } catch (e) {
          console.error('Failed to sync progress', e);
        }
      }
      
      // Only auto-scroll if it's naturally ending and it's the current video
      if (index === currentIndex && index < videos.length - 1) {
        const el = document.querySelector(`[data-index="${index + 1}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const loadQuiz = async (videoId, index) => {
    setQuizLoading(true);
    setQuizModalOpen(true);
    setQuizAnswers({});
    setQuizResult(null);
    try {
      const res = await quizApi.getQuiz(videoId);
      setActiveQuiz({ videoId, index, questions: res.quiz });
    } catch(e) {
      console.error(e);
      setQuizModalOpen(false);
      markCompleted(videoId, index);
    } finally {
      setQuizLoading(false);
    }
  };

  const submitQuiz = async () => {
    if (!activeQuiz) return;
    let score = 0;
    activeQuiz.questions.forEach((q, i) => {
      if (quizAnswers[i] === q.answer) score++;
    });
    
    try {
      const res = await quizApi.submitQuiz(activeQuiz.videoId, score);
      setQuizResult({ score, total: activeQuiz.questions.length, bonusXp: res.bonusXp });
      // Wait a moment then close and mark completed
      setTimeout(() => {
        setQuizModalOpen(false);
        markCompleted(activeQuiz.videoId, activeQuiz.index);
        setActiveQuiz(null);
      }, 3000);
    } catch(e) {
      console.error(e);
      setQuizModalOpen(false);
      markCompleted(videoId, index);
    }
  };

  const handleVideoEnded = (videoId, index) => {
    if (status === 'authenticated' && !completedVideos.includes(videoId)) {
      loadQuiz(videoId, index);
    } else {
      markCompleted(videoId, index);
    }
  };

  const handleTimeUpdate = (e, videoId, index) => {
    const videoElement = e.target;
    if (!videoElement.duration) return;
    const progress = videoElement.currentTime / videoElement.duration;
    // We handle completion in onEnded now to show the quiz
  };

  const toggleLike = (videoId) => {
    setLikedVideos(prev => ({ ...prev, [videoId]: !prev[videoId] }));
  };

  const saveBookmark = async (videoId, index) => {
    if (status !== 'authenticated') return alert('Please login to bookmark');
    const time = videoRefs.current[index]?.currentTime;
    if (!time) return;
    
    try {
      await timestampApi.saveTimestamp(videoId, time, 'Saved from video player');
      alert(`Bookmark saved at ${Math.floor(time)}s`);
    } catch (e) {
      console.error(e);
      alert('Failed to save bookmark');
    }
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

      {/* AI Quiz Modal */}
      {quizModalOpen && (
        <div className="feedback-modal-overlay">
          <div className="feedback-modal" style={{ maxWidth: '500px', width: '100%' }}>
            {quizLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <h2 className="gradient-text">🤖 Generating AI Quiz...</h2>
                <p>Analyzing video content...</p>
              </div>
            ) : quizResult ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <h1 style={{ fontSize: '48px', margin: '0' }}>{quizResult.score}/{quizResult.total}</h1>
                <h2 className="gradient-text">Quiz Complete!</h2>
                <p>You earned <strong style={{ color: 'var(--accent-primary)' }}>+{quizResult.bonusXp} XP</strong></p>
                <p style={{ fontSize: '14px', color: 'var(--fg-muted)', marginTop: '20px' }}>Continuing to next lesson...</p>
              </div>
            ) : activeQuiz ? (
              <div>
                <h2 className="gradient-text" style={{ marginBottom: '24px' }}>Pop Quiz!</h2>
                <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '12px' }}>
                  {activeQuiz.questions.map((q, idx) => (
                    <div key={idx} style={{ marginBottom: '24px', background: 'var(--bg-surface)', padding: '16px', borderRadius: '12px' }}>
                      <p style={{ fontWeight: 600, marginBottom: '16px' }}>{idx + 1}. {q.question}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {q.options.map((opt, oIdx) => (
                          <label key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' }}>
                            <input 
                              type="radio" 
                              name={`q-${idx}`} 
                              checked={quizAnswers[idx] === opt}
                              onChange={() => setQuizAnswers(prev => ({ ...prev, [idx]: opt }))}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                  <button className="btn-secondary" onClick={() => {
                    setQuizModalOpen(false);
                    markCompleted(activeQuiz.videoId, activeQuiz.index);
                  }}>Skip Quiz</button>
                  <button className="btn-primary" onClick={submitQuiz} disabled={Object.keys(quizAnswers).length < activeQuiz.questions.length}>
                    Submit Answers
                  </button>
                </div>
              </div>
            ) : null}
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
                <HLSVideoPlayer 
                  videoRef={el => videoRefs.current[index] = el}
                  src={videoUrl}
                  startTime={video.id === targetVideoId ? parseFloat(targetTime) : 0}
                  onTimeUpdate={(e) => handleTimeUpdate(e, video.id, index)}
                  onEnded={() => handleVideoEnded(video.id, index)}
                />

                <div className="player-actions">
                  <div 
                    className={`player-action-btn ${isLiked ? 'active' : ''}`} 
                    title="Like"
                    onClick={() => toggleLike(video.id)}
                  >
                    {isLiked ? '❤️' : '🤍'}
                  </div>
                  <div className="player-action-btn" title="Comments" onClick={() => setActiveCommentVideoId(video.id)}>💬</div>
                  <div className="player-action-btn" title="Bookmark" onClick={() => saveBookmark(video.id, index)}>🔖</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CommentSheet videoId={activeCommentVideoId} onClose={() => setActiveCommentVideoId(null)} />
    </div>
  );
}
