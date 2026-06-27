import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { videoApi } from '../api/endpoints';
import { selectIsAuthenticated } from '../redux/authSlice';

const sheetVariants = {
  hidden: { y: '100%' },
  visible: { y: 0, transition: { type: 'spring', stiffness: 320, damping: 32 } },
  exit: { y: '100%', transition: { duration: 0.2 } },
};

function CommentSkeleton() {
  return (
    <div className="comment-skeleton">
      {[0, 1, 2].map((i) => <div key={i} className="skeleton-line" />)}
    </div>
  );
}

export default function CommentSheet({ videoId, open, onClose }) {
  const authed = useSelector(selectIsAuthenticated);
  const [status, setStatus] = useState('idle');
  const [comments, setComments] = useState([]);
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setStatus('loading');
    videoApi.comments(videoId)
      .then((data) => { if (!cancelled) { setComments(data.comments); setStatus('ready'); } })
      .catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, [open, videoId]);

  const submit = async () => {
    const content = draft.trim();
    if (!content) return;
    setPosting(true);
    setPostError(null);
    try {
      const { comment } = await videoApi.comment(videoId, content);
      setComments((prev) => [comment, ...prev]);
      setDraft('');
    } catch {
      setPostError('Could not post your comment. Try again.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="sheet-backdrop" onClick={onClose}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div className="comment-sheet"
            variants={sheetVariants} initial="hidden" animate="visible" exit="exit"
            drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={0.2}
            onDragEnd={(_, info) => { if (info.offset.y > 120) onClose(); }}>
            <div className="sheet-grab" />
            <h4>Comments</h4>

            <div className="comment-list">
              {status === 'loading' && <CommentSkeleton />}
              {status === 'error' && <p className="muted">Couldn’t load comments.</p>}
              {status === 'ready' && comments.length === 0 && (
                <p className="muted">No comments yet — be the first.</p>
              )}
              {status === 'ready' && comments.map((c) => (
                <div key={c.id} className="comment-row">
                  <strong>{c.user_name}</strong>
                  <span>{c.content}</span>
                </div>
              ))}
            </div>

            {authed ? (
              <div className="comment-composer">
                <input value={draft} onChange={(e) => setDraft(e.target.value)}
                  placeholder="Add a comment…" maxLength={1000}
                  onKeyDown={(e) => e.key === 'Enter' && submit()} />
                <button onClick={submit} disabled={posting || !draft.trim()}>
                  {posting ? 'Posting…' : 'Post'}
                </button>
              </div>
            ) : (
              <p className="muted">Log in to comment.</p>
            )}
            {postError && <p className="error-text">{postError}</p>}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
