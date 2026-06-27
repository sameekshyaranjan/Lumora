import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import useIntersectionObserver from '../hooks/useIntersectionObserver';
import VideoPlayer from './VideoPlayer';
import VideoOverlay from './VideoOverlay';

export default function VideoCard({ video, onReachEnd, isLast }) {
  const [ref, inView] = useIntersectionObserver({ threshold: 0.6 });
  const firedEnd = useRef(false);

  useEffect(() => {
    if (isLast && inView && onReachEnd && !firedEnd.current) {
      firedEnd.current = true;
      onReachEnd();
    }
  }, [isLast, inView, onReachEnd]);

  return (
    <motion.section
      ref={ref}
      className="video-card"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <VideoPlayer video={video} active={inView} />
      <VideoOverlay video={video} />
    </motion.section>
  );
}
