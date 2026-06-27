import { useState } from 'react';
import useInfiniteFeed from '../hooks/useInfiniteFeed';
import CategoryTabs from '../components/CategoryTabs';
import VideoCard from '../components/VideoCard';
import FeedSkeleton from '../components/FeedSkeleton';

export default function FeedPage() {
  const [category, setCategory] = useState(null);
  const { videos, loadMore, loading, error, hasMore } = useInfiniteFeed(category);

  if (loading && videos.length === 0) return <div className="page"><FeedSkeleton /></div>;
  if (error && videos.length === 0) {
    return <div className="page feed-error">Couldn’t load courses. <button onClick={loadMore}>Retry</button></div>;
  }

  return (
    <div className="page courses-page">
      <div className="courses-header">
        <h2>Explore Courses</h2>
        <CategoryTabs active={category} onChange={setCategory} inline={true} />
      </div>

      <div className="course-grid">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onReachEnd={hasMore ? loadMore : undefined}
            isLast={video.id === videos[videos.length - 1]?.id}
          />
        ))}
      </div>
      
      {loading && videos.length > 0 && <div className="loading-more">Loading more courses...</div>}
    </div>
  );
}
