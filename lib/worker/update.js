var util = require('util');
var moment = require('moment');
var config = require('../config');
var twitter = require('../twitter');
var mongodb = require('../db');

var update = function(username, callback) {
  getUser(username, function(err, user) {
    if (err) return callback(err);
    console.log('getUser: ' + util.inspect(user));
    updateTwitterBio(user, function(err, result) {
      if (err) return callback(err);
      updateMongoLastUpdated(user, function(err, result) {
        callback(err);
      });
    });
  });
};

var getUser = function(username, callback) {
  mongodb.users(function(err, users) {
    if (err) return callback(err);
    users.findOne({
      'twitter.username': username
    }, function(err, user) {
      if (err) return callback(err);
      callback(null, {
        username: user.twitter.username,
        token: user.twitter.token,
        tokenSecret: user.twitter.tokenSecret,
        languages: (user.languages || [])
      });
    });
  });
};

var updateTwitterBio = function(user, callback) {
  twitter.getDescription(user, function(err, description) {
    if (err) return callback(err);
    var newDesc = formatDescription(description, user.languages);
    twitter.setDescription(user, newDesc, callback);
  });
};

var formatDescription = function(description, languages) {
  var d = ' #';
  var like = 'like:' + (languages.length > 0 ? d : '') + languages.join(d);
  var p = /like:.*$/;
  return p.test(description) ? description.replace(p, like) : (description + like);
};

var updateMongoLastUpdated = function(user, callback) {
  mongodb.users(function(err, users) {
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
