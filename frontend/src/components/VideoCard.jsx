import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import useIntersectionObserver from '../hooks/useIntersectionObserver';

export default function VideoCard({ video, onReachEnd, isLast }) {
  const [ref, inView] = useIntersectionObserver({ threshold: 0.1 });
  const firedEnd = useRef(false);

  useEffect(() => {
    if (isLast && inView && onReachEnd && !firedEnd.current) {
      firedEnd.current = true;
      onReachEnd();
    }
  }, [isLast, inView, onReachEnd]);

  // Generate a random-ish color based on the video ID for a placeholder thumbnail
  const hue = [...video.id].reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;
  const gradient = `linear-gradient(135deg, hsl(${hue}, 80%, 60%), hsl(${(hue + 40) % 360}, 80%, 40%))`;

  return (
    <motion.div
      ref={ref}
      className="course-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Link to={`/course/${video.id}`} className="course-card-link">
        <div className="course-thumbnail" style={{ background: gradient }}>
          <div className="play-icon">▶</div>
        </div>
        <div className="course-info">
          <span className="course-cat">{video.category}</span>
          <h3 className="course-title">{video.title}</h3>
          <div className="course-stats">
            <span>❤️ {video.like_count} likes</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
