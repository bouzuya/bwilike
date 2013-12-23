var passport = require('../../passport');
var mongodb = require('../../db');

module.exports = function(req, res) {
  var userId = req.session.passport.user;
  mongodb.users(function(err, users) {
    if (err) throw err;
    users.findOne({
      id: userId
    }, function(err, u) {
      if (err) throw err;
      u.github = req.user.github;
      req.user = u;
      users.update(
        { id: userId },
        { $set: { github: u.github } },
        function(err) {
          if (err) throw err;
          res.redirect('/status');
        });
    });
  });
};
