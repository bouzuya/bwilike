var util = require('util');
var config = require('../config');
var twitter = require('../twitter');
var db = require('../db');

var update = function(userId, callback) {
  getUser(userId, function(err, user) {
    if (err) return callback(err);
    console.log('getUser: ' + util.inspect(user));
    updateTwitterBio(user, function(err, result) {
      if (err) return callback(err);
      console.log('updateTwitterBio: ' + util.inspect(result));
      updateMongoLastUpdated(user, function(err, result) {
        callback(err);
      });
    });
  });
};

var getUser = function(userId, callback) {
  db.users(function(err, users) {
    if (err) return callback(err);
    users.findOne({
      id: userId
    }, function(err, user) {
      if (err) return callback(err);
      callback(null, {
        id: user.id,
        token: user.twitter.token,
        tokenSecret: user.twitter.tokenSecret,
        languages: user.languages
      });
    });
  });
};

var updateTwitterBio = function(user, callback) {
  twitter.getDescription(function(err, description) {
    if (err) return callback(err);
    var newDesc = formatDescription(description, user.languages);
    twitter.setDescription(newDesc, function(err) {
      callback(err);
    });
  });
};

var formatDescription = function(description, languages) {
  var d = ' #';
  var like = 'like:' + (languages.length > 0 ? d : '') + languages.join(d);
  var p = /like:.*$/;
  return p.test(desc) ? description.replace(p, like) : (description + like);
};

var updateMongoLastUpdated = function(user, callback) {
  db.users(function(err, users) {
    if (err) return callback(err);
    users.update({
      id: user.id
    }, {
      $set: {
        last_updated: moment().format()
      }
    }, {}, function(err, result) {
      if (err) return callback(err);
      callback(null, result);
    });
  });
};

module.exports = update;
