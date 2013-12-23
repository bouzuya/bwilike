module.exports = function(req, res) {
  res.render('index.jade', { user: req.session.user });
};
