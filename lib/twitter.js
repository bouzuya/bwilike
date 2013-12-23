var Twitter = require('twitter');

var newTwitter = function() {
  var options = {};
  options.consumer_key = config.twitterConsumerKey;
  options.consumer_secret = config.twitterConsumerSecret;
  options.access_token_key = user.token;
  options.access_token_secret = user.tokenSecret;
  return new Twitter(options);
};

var getDescription = function(callback) {
  var twitter = newTwitter();
  twitter.showUser(user.id, function(data) {
    if (!data) return callback(new Error('data is not truthy'));
    if (!data.description) return callback(new Error('description is not truthy'));
    callback(null, description);
  });
};

var setDescription = function(description, callback) {
  var twitter = newTwitter();
  twitter.updateProfile({
    description: description
  }, function(data) {
    callback();
  });
};

module.exports.getDescription = getDescription;
module.exports.setDescription = setDescription;
