var github = require('./github');
var db = require('../db');

var fetch = function(userId, callback) {
  getMongoToken(userId, function(err, user) {
    if (err) return callback(err);
    github().fetch(user.token, user.username, function(err, likes) {
      if (err) return callback(err);
      callback(null, likes.map(function(like) { return like.language; }));
    });
  });
};

var getMongoToken = function(userId, callback) {
  db.users(function(err, users) {
    if (err) return callback(err);
    users.findOne({
      id: userId
    }, function(err, user) {
      if (err) return callback(err);
      if (user && user.github) {
        callback(null, { username: user.github.username, token: user.github.token });
      } else {
        callback(new Error('no github token'));
      }
    });
  });
};

module.exports = fetch;
