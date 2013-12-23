var db = require('../db');

module.exports = function(req, res) {
  if (!req.session.user) {
    res.redirect('/');
    return;
  }

  db.users(function(err, users) {
    if (err) throw err;
    users.findOne({
      id: req.session.user.id
    }, function(err, u) {
      res.render('status.jade', { user: u });
    });
  });
};
