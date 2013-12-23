var db = require('../db');

module.exports = function(req, res) {
  res.render('status.jade', { user: req.user });
};
