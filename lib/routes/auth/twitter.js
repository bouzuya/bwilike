var db = require('../../db');

module.exports = function(req, res) {
  var u = {};
  u.id = req.user.profile.username;
  var twitter = {
    token: req.user.token,
    tokenSecret: req.user.tokenSecret
  };
  u.twitter = twitter;

  // store session
  req.session.user = u;

  // update db
  db.users(function(err, users) {
    if (err) throw err;
    users.findOne({
      id: u.id
    }, function(err, user) {
      if (err) throw err;
      if (user) {
        users.update(
          { id: u.id },
          { $set: { twitter: u.twitter } },
          { upsert: true },
          function(err, result) {
            if (err) throw err;
            res.redirect('/status');
          });
      }
    });
  });
};
