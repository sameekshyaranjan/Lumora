import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { videoApi } from '../api/endpoints';
import useWatchHistory from '../hooks/useWatchHistory';
import VideoPlayer from '../components/VideoPlayer';

export default function CurriculumPlayerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { watched } = useWatchHistory();
  
  const [lessons, setLessons] = useState([]);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Engagement state
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  
  // Comments state
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    // Fetch curriculum list
    videoApi.list({ limit: 10 }).then((data) => {
      const curriculum = data.videos.filter(v => v.category === 'Language');
      const ordered = curriculum.sort((a, b) => a.title.localeCompare(b.title));
      setLessons(ordered);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    videoApi.get(id)
      .then((data) => {
        setVideo(data.video);
        setLiked(data.engagement.liked);
        setLikeCount(data.video.like_count);
        setLoading(false);
      })
      .catch(() => setLoading(false));
      
    videoApi.comments(id)
      .then((data) => setComments(data.comments))
      .catch(() => {});
  }, [id]);

  const toggleLike = async () => {
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!prevLiked);
    setLikeCount(prevCount + (prevLiked ? -1 : 1));
    try {
      const res = await (prevLiked ? videoApi.unlike(video.id) : videoApi.like(video.id));
      setLikeCount(res.like_count);
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
    }
  };

  const postComment = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    try {
      const res = await videoApi.comment(video.id, content);
      setComments([res.comment, ...comments]);
      setContent('');
    } finally {
      setPosting(false);
    }
  };

  if (loading || !video) {
    return <div className="split-layout"><div className="loading-more">Loading lesson...</div></div>;
  }

  // Find next lesson for auto-advance or button
  const currentIndex = lessons.findIndex(l => l.id === video.id);
  const nextLesson = currentIndex !== -1 && currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  return (
    <div className="split-layout">
      <div className="split-main">
        <div className="course-video-container">
          <VideoPlayer video={video} active={true} />
        </div>
        
        <div className="course-content-container">
          <div className="course-header">
            <h2>{video.title}</h2>
            <p className="lesson-desc">{video.description}</p>
            
            <div className="course-actions">
              <button className={`action-btn ${liked ? 'is-active' : ''}`} onClick={toggleLike}>
                ❤️ {likeCount} Likes
              </button>
            </div>
          </div>
          
          <div className="course-discussion">
            <h3>Discussion ({comments.length})</h3>
            
            <form className="comment-composer-inline" onSubmit={postComment}>
              <input 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                placeholder="Ask a question or share your thoughts..."
                disabled={posting}
              />
              <button type="submit" disabled={posting || !content.trim()}>
                {posting ? 'Posting...' : 'Post'}
              </button>
            </form>

            <div className="comment-list-inline">
              {comments.map((c) => (
                <div key={c.id} className="comment-row">
                  <strong>{c.user_name}</strong>
                  <span>{c.content}</span>
                </div>
              ))}
              {comments.length === 0 && <p className="muted">No comments yet. Start the discussion!</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="split-sidebar">
        <div className="sidebar-header">
          <h3>Course Content</h3>
          <span>3 Lessons</span>
        </div>
        
        <div className="curriculum-list">
          {lessons.map((lesson, idx) => {
            const isActive = lesson.id === video.id;
            const isCompleted = watched.some(w => w.id === lesson.id);
            
            return (
              <Link 
                key={lesson.id} 
                to={`/course/german/lesson/${lesson.id}`} 
                className={`curriculum-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              >
                <div className="lesson-status">
                  {isCompleted ? '✓' : (idx + 1)}
                </div>
                <div className="lesson-info">
                  <h4>{lesson.title}</h4>
                  <span>Video Lesson</span>
                </div>
              </Link>
            );
          })}
        </div>

        {nextLesson && (
          <div className="next-lesson-prompt">
            <p>Up Next</p>
            <Link to={`/course/german/lesson/${nextLesson.id}`} className="btn-primary" style={{ display: 'block', textAlign: 'center' }}>
              Next: {nextLesson.title}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
