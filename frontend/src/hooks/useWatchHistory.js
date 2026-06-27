import { useCallback, useState } from 'react';

const KEY = 'lumora:watchHistory';

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}
function write(list) { localStorage.setItem(KEY, JSON.stringify(list)); }

export default function useWatchHistory() {
  const [watched, setWatched] = useState(read);

  const markWatched = useCallback(({ id, title }) => {
    setWatched((prev) => {
      const without = prev.filter((w) => w.id !== id);
      const entry = { id, title, completed: prev.find((w) => w.id === id)?.completed || false, lastSeen: Date.now() };
      const next = [entry, ...without].slice(0, 50);
      write(next);
      return next;
    });
  }, []);

  const markCompleted = useCallback((id) => {
    setWatched((prev) => {
      const next = prev.map((w) => (w.id === id ? { ...w, completed: true } : w));
      write(next);
      return next;
    });
  }, []);

  const isCompleted = useCallback((id) => !!watched.find((w) => w.id === id)?.completed, [watched]);

  return { watched, markWatched, markCompleted, isCompleted };
}
