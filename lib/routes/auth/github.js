var db = require('../../db');

module.exports = function(req, res) {
  if (!req.session.user) {
    res.redirect('/');
    return;
  };

  var u = req.session.user;
  var github = {
    id: req.user.profile.username,
    token: req.user.token,
    refreshToken: req.user.refreshToken
  };
  u.github = github;

  // update db
  db.users(function(err, users) {
    if (err) throw err;
    users.update(
      { id: u.id },
      u,
      { upsert: true },
      function(err, result) {
        if (err) throw err;
        res.redirect('/status');
      });
  });
};
