var Twitter = require('twitter');
var config = require('./config');

var newTwitter = function(user) {
  var options = {};
  options.consumer_key = config.twitterConsumerKey;
  options.consumer_secret = config.twitterConsumerSecret;
  options.access_token_key = user.token;
  options.access_token_secret = user.tokenSecret;
  return new Twitter(options);
};

var getDescription = function(user, callback) {
  var twitter = newTwitter(user);
  twitter.showUser(user.username, function(data) {
    if (!data) return callback(new Error('data is not truthy'));
    // if (!data.description) return callback(new Error('description is not truthy'));
    callback(null, data.description);
  });
};

var setDescription = function(user, description, callback) {
  var twitter = newTwitter(user);
  twitter.updateProfile({
    description: description
  }, function(data) {
    callback();
  });
};

module.exports.getDescription = getDescription;
module.exports.setDescription = setDescription;
