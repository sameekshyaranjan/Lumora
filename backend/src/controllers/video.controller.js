const videoService = require('../services/video.service');
const { ok, created } = require('../utils/respond');

async function list(req, res, next) {
  try {
    const { cursor, limit, category } = req.query;
    const data = await videoService.listVideos({ cursor, limit, category });
    return ok(res, data, 'OK'); // data = { videos, nextCursor }
  } catch (e) { next(e); }
}

async function getOne(req, res, next) {
  try {
    const video = await videoService.getVideo(req.params.id);
    return ok(res, { video }, 'OK');
  } catch (e) { next(e); }
}

async function create(req, res, next) {
  try {
    const video = await videoService.createVideo(req.body);
    return created(res, { video }, 'Video created');
  } catch (e) { next(e); }
}

module.exports = { list, getOne, create };
