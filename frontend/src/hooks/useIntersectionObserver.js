import { useEffect, useRef, useState } from 'react';

export default function useIntersectionObserver({ threshold = 0.6, root = null } = {}) {
  const ref = useRef(null);
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting),
      { threshold, root }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, root]);

  return [ref, isIntersecting];
}
