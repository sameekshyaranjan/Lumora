import { useEffect, useRef, useState } from 'react';
import useWatchHistory from '../hooks/useWatchHistory';

const API = import.meta.env.VITE_API_URL;

export default function VideoPlayer({ video, active }) {
  const videoRef = useRef(null);
  const completedRef = useRef(false);
  const [state, setState] = useState('loading');
  const { markWatched, markCompleted } = useWatchHistory();

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (active && state === 'ready') {
      el.play().catch(() => {});
      markWatched({ id: video.id, title: video.title });
    } else {
      el.pause();
    }
  }, [active, state, video.id, video.title, markWatched]);

  const handleTimeUpdate = (e) => {
    const el = e.currentTarget;
    if (!completedRef.current && el.duration > 0 && el.currentTime / el.duration >= 0.9) {
      completedRef.current = true;
      markCompleted(video.id);
    }
  };

  return (
    <div className="player-wrap">
      {state === 'loading' && <div className="player-spinner" aria-label="Loading video" />}
      {state === 'buffering' && <div className="player-spinner" aria-label="Buffering" />}
      {state === 'error' && (
        <div className="player-error">
          <p>Video failed to load.</p>
          <button onClick={() => { setState('loading'); videoRef.current?.load(); }}>Retry</button>
        </div>
      )}

      <video
        ref={videoRef}
        className="player-video"
        src={`${API}${video.file_path}`}
        loop
        muted
        playsInline
        preload="metadata"
        onLoadedData={() => setState('ready')}
        onWaiting={() => setState('buffering')}
        onPlaying={() => setState('ready')}
        onError={() => setState('error')}
        onTimeUpdate={handleTimeUpdate}
      />
    </div>
  );
}
