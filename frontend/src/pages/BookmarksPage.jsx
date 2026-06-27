import { useEffect, useState } from 'react';
import { videoApi } from '../api/endpoints';
import useWatchHistory from '../hooks/useWatchHistory';

export default function BookmarksPage() {
  const [state, setState] = useState('loading');
  const [videos, setVideos] = useState([]);
  const { isCompleted } = useWatchHistory();

  useEffect(() => {
    videoApi.bookmarks()
      .then((data) => {
        setVideos(data.videos);
        setState(data.videos.length ? 'ready' : 'empty');
      })
      .catch(() => setState('error'));
  }, []);

  return (
    <div className="page">
      <h2>Saved Learning</h2>
      {state === 'loading' && <p className="muted">Loading…</p>}
      {state === 'empty' && <p className="muted">Nothing saved yet. Tap 🔖 on a video to save it.</p>}
      {state === 'error' && <p className="error-text">Couldn’t load your saved videos.</p>}
      {state === 'ready' && (
        <ul className="saved-list">
          {videos.map((v) => (
            <li key={v.id} className="saved-item">
              <div>
                <strong>{v.title}</strong>
                <span className="overlay-cat">{v.category}</span>
              </div>
              {isCompleted(v.id) && <span className="badge-completed">✓ Completed</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
