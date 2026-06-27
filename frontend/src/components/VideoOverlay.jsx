import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { videoApi } from '../api/endpoints';
import { selectIsAuthenticated } from '../redux/authSlice';
import CommentSheet from './CommentSheet';

export default function VideoOverlay({ video }) {
  const authed = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(video.like_count);
  const [bookmarked, setBookmarked] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const requireAuth = () => {
    if (!authed) { navigate('/login'); return false; }
    return true;
  };

  const toggleLike = async () => {
    if (!requireAuth()) return;
    const prevLiked = liked;
    const prevCount = likeCount;
    const nextLiked = !prevLiked;

    setLiked(nextLiked);
    setLikeCount((c) => c + (nextLiked ? 1 : -1));

    try {
      const data = nextLiked ? await videoApi.like(video.id) : await videoApi.unlike(video.id);
      setLikeCount(data.like_count);
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
    }
  };

  const toggleBookmark = async () => {
    if (!requireAuth()) return;
    const prev = bookmarked;
    setBookmarked(!prev);
    try {
      prev ? await videoApi.unbookmark(video.id) : await videoApi.bookmark(video.id);
    } catch {
      setBookmarked(prev);
    }
  };

  return (
    <>
      <div className="overlay">
        <div className="overlay-meta">
          <h3>{video.title}</h3>
          <span className="overlay-cat">{video.category}</span>
        </div>

        <div className="overlay-actions">
          <motion.button whileTap={{ scale: 0.8 }} onClick={toggleLike}
            className={`icon-btn ${liked ? 'is-active' : ''}`} aria-label="Like">
            ♥<span className="count">{likeCount}</span>
          </motion.button>

          <motion.button whileTap={{ scale: 0.8 }} onClick={() => setSheetOpen(true)}
            className="icon-btn" aria-label="Comments">💬</motion.button>

          <motion.button whileTap={{ scale: 0.8 }} onClick={toggleBookmark}
            className={`icon-btn ${bookmarked ? 'is-active' : ''}`} aria-label="Bookmark">🔖</motion.button>
        </div>
      </div>

      <CommentSheet videoId={video.id} open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}
