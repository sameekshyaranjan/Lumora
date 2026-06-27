import useWatchHistory from '../hooks/useWatchHistory';

export default function HistoryPage() {
  const { watched } = useWatchHistory();
  
  if (watched.length === 0) {
    return <div className="page"><h2>History</h2><p className="muted">Nothing watched yet.</p></div>;
  }

  return (
    <div className="page">
      <h2>History</h2>
      <ul className="saved-list">
        {watched.map((w) => (
          <li key={w.id} className="saved-item">
            <strong>{w.title}</strong>
            {w.completed
              ? <span className="badge-completed">✓ Completed</span>
              : <span className="badge-progress">In progress</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
