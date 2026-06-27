const send = (res, status, success, data, message) =>
  res.status(status).json({ success, data, message });

module.exports = {
  ok:      (res, data, message = 'OK')      => send(res, 200, true, data, message),
  created: (res, data, message = 'Created') => send(res, 201, true, data, message),
};
