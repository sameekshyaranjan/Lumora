import { Link } from 'react-router-dom';
import useWatchHistory from '../hooks/useWatchHistory';

export default function ContinueWatchingRow() {
  const { watched } = useWatchHistory();
  const continueItems = watched.filter((w) => !w.completed).slice(0, 8);
  if (continueItems.length === 0) return null;

  return (
    <div className="continue-row">
      <span className="continue-label">Continue Watching</span>
      <div className="continue-items">
        {continueItems.map((w) => (
          <Link key={w.id} to="/" className="continue-chip" title={w.title}>{w.title}</Link>
        ))}
      </div>
    </div>
  );
}
