import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import useInfiniteFeed from '../hooks/useInfiniteFeed';
import useWatchHistory from '../hooks/useWatchHistory';
import CategoryTabs from '../components/CategoryTabs';
import ContinueWatchingRow from '../components/ContinueWatchingRow';
import VideoCard from '../components/VideoCard';
import FeedSkeleton from '../components/FeedSkeleton';

export default function FeedPage() {
  const [category, setCategory] = useState(null);
  const { videos, loadMore, loading, error, hasMore } = useInfiniteFeed(category);
  const { watched } = useWatchHistory();

  if (loading && videos.length === 0) return <FeedSkeleton />;
  if (error && videos.length === 0) {
    return <div className="feed-error">Couldn’t load the feed. <button onClick={loadMore}>Retry</button></div>;
  }

  return (
    <div className="feed-shell">
      <CategoryTabs active={category} onChange={setCategory} />
      <ContinueWatchingRow watchedIds={watched.map((w) => w.id)} />

      <div className="feed-scroller">
        <AnimatePresence initial={false}>
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onReachEnd={hasMore ? loadMore : undefined}
              isLast={video.id === videos[videos.length - 1]?.id}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
