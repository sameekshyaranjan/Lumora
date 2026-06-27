import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { videoApi } from '../api/endpoints';
import VideoPlayer from '../components/VideoPlayer';

export default function CourseDetailPage() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Engagement state
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  
  // Comments state
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    videoApi.get(id)
      .then((data) => {
        setVideo(data.video);
        setLiked(data.engagement.liked);
        setLikeCount(data.video.like_count);
        setBookmarked(data.engagement.bookmarked);
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

  const toggleBookmark = async () => {
    const prev = bookmarked;
    setBookmarked(!prev);
    try {
      await (prev ? videoApi.unbookmark(video.id) : videoApi.bookmark(video.id));
    } catch {
      setBookmarked(prev);
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

  if (loading) return <div className="page"><div className="loading-more">Loading course...</div></div>;
  if (!video) return <div className="page error-text">Course not found.</div>;

  return (
    <div className="course-detail-page">
      <div className="course-video-container">
        <VideoPlayer video={video} active={true} />
      </div>
      
      <div className="course-content-container">
        <div className="course-header">
          <span className="course-cat">{video.category}</span>
          <h2>{video.title}</h2>
          
          <div className="course-actions">
            <button className={`action-btn ${liked ? 'is-active' : ''}`} onClick={toggleLike}>
              ❤️ {likeCount} Likes
            </button>
            <button className={`action-btn ${bookmarked ? 'is-active' : ''}`} onClick={toggleBookmark}>
              🔖 {bookmarked ? 'Saved' : 'Save'}
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
  );
}
