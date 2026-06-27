import { useEffect, useState } from 'react';
import { videoApi } from '../api/endpoints';

export default function CategoryTabs({ active, onChange, inline = false }) {
  const [cats, setCats] = useState([]);
  
  useEffect(() => {
    videoApi.list({ limit: 20 }).then((data) => {
      const unique = [...new Set(data.videos.map((v) => v.category))];
      setCats(unique);
    }).catch(() => setCats([]));
  }, []);

  return (
    <div className={`category-tabs ${inline ? 'inline-tabs' : ''}`}>
      <button className={!active ? 'tab is-active' : 'tab'} onClick={() => onChange(null)}>All</button>
      {cats.map((c) => (
        <button key={c} className={active === c ? 'tab is-active' : 'tab'} onClick={() => onChange(c)}>{c}</button>
      ))}
    </div>
  );
}
