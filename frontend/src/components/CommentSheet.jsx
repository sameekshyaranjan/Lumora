import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { videoApi } from '../api/endpoints';
import { useSelector } from 'react-redux';
import { selectAuth } from '../redux/authSlice';

export default function CommentSheet({ videoId, onClose }) {
  const { status, user } = useSelector(selectAuth);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!videoId) return;
    setLoading(true);
    videoApi.comments(videoId)
      .then(res => setComments(res.comments || []))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [videoId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || status !== 'authenticated') return;
    
    setSubmitting(true);
    try {
      const res = await videoApi.comment(videoId, inputValue.trim());
      // Optimistic/Immediate update
      setComments(prev => [res.comment, ...prev]);
      setInputValue('');
    } catch(e) {
      console.error(e);
      alert('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {videoId && (
        <>
          <motion.div 
            className="comment-sheet-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div 
            className="comment-sheet-container"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260, mass: 0.8 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragEnd={(e, { offset, velocity }) => {
              if (offset.y > 100 || velocity.y > 500) {
                onClose();
              }
            }}
          >
            <div className="comment-sheet-header">
              <div className="drag-handle" />
              <h3>Comments <span style={{ color: 'var(--fg-muted)', fontSize: '14px', fontWeight: 'normal' }}>{comments.length}</span></h3>
              <button className="close-btn" onClick={onClose}>✕</button>
            </div>
            
            <div className="comment-list">
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--fg-muted)' }}>
                  Loading comments...
                </div>
              ) : comments.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--fg-muted)', gap: '12px', opacity: 0.7 }}>
                  <div style={{ fontSize: '48px' }}>💬</div>
                  <div>No comments yet. Be the first to start the conversation!</div>
                </div>
              ) : (
                comments.map(c => (
                  <div key={c.id} className="comment-item">
                    <div className="comment-avatar">{c.username?.charAt(0).toUpperCase() || 'U'}</div>
                    <div className="comment-content">
                      <div className="comment-meta">
                        <span className="comment-author">{c.username || 'User'}</span>
                        <span className="comment-time">{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="comment-text">{c.content}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="comment-input-area">
              {status === 'authenticated' ? (
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="Add a comment..." 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={submitting}
                  />
                  <button type="submit" className="btn-primary" disabled={submitting || !inputValue.trim()}>
                    {submitting ? '...' : 'Post'}
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--fg-muted)', fontSize: '14px', padding: '8px 0' }}>
                  Log in to post a comment
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
