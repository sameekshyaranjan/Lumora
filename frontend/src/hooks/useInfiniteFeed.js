import { useCallback, useEffect, useRef, useState } from 'react';
import { videoApi } from '../api/endpoints';

export default function useInfiniteFeed(category) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const cursorRef = useRef(null);
  const inflight = useRef(false);

  useEffect(() => {
    setVideos([]);
    setHasMore(true);
    cursorRef.current = null;
    inflight.current = false;
  }, [category]);

  const loadMore = useCallback(async () => {
    if (inflight.current || !hasMore) return;
    inflight.current = true;
    setLoading(true);
    setError(null);
    try {
      const data = await videoApi.list({
        cursor: cursorRef.current,
        limit: 5,
        category: category || undefined,
      });
      setVideos((prev) => [...prev, ...data.videos]);
      cursorRef.current = data.nextCursor;
      setHasMore(Boolean(data.nextCursor));
    } catch (e) {
      setError('Failed to load videos');
    } finally {
      setLoading(false);
      inflight.current = false;
    }
  }, [category, hasMore]);

  useEffect(() => { loadMore(); }, [category, loadMore]);

  return { videos, loadMore, loading, error, hasMore };
}
