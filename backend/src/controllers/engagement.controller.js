const svc = require('../services/engagement.service');
const { ok, created } = require('../utils/respond');

const like = async (req, res, next) => {
  try { return ok(res, await svc.likeVideo(req.user.id, req.params.id), 'Liked'); }
  catch (e) { next(e); }
};
const unlike = async (req, res, next) => {
  try { return ok(res, await svc.unlikeVideo(req.user.id, req.params.id), 'Unliked'); }
  catch (e) { next(e); }
};
const comment = async (req, res, next) => {
  try {
    const c = await svc.addComment(req.user.id, req.params.id, req.body.content);
    return created(res, { comment: c }, 'Comment added');
  } catch (e) { next(e); }
};
const listComments = async (req, res, next) => {
  try {
    const comments = await svc.listComments(req.params.id);
    return ok(res, { comments }, 'OK');
  } catch (e) { next(e); }
};
const bookmark = async (req, res, next) => {
  try { return ok(res, await svc.addBookmark(req.user.id, req.params.id), 'Saved'); }
  catch (e) { next(e); }
};
const unbookmark = async (req, res, next) => {
  try { return ok(res, await svc.removeBookmark(req.user.id, req.params.id), 'Removed'); }
  catch (e) { next(e); }
};

module.exports = { like, unlike, comment, listComments, bookmark, unbookmark };
