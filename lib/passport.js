var passport = require('passport');
var passportTwitter = require('passport-twitter');
var passportGithub = require('passport-github');
var config = require('./config');

// twitter settings
passport.use(new passportTwitter.Strategy({
  consumerKey: config.twitterConsumerKey,
  consumerSecret: config.twitterConsumerSecret,
  callbackURL: config.twitterCallbackUrl,
}, function(token, tokenSecret, profile, done) {
  var user = { token: token, tokenSecret: tokenSecret, profile: profile };
  done(null, user);
}));

// github settings
passport.use(new passportGithub.Strategy({
  clientID: config.githubClientId,
  clientSecret: config.githubClientSecret,
  callbackURL: config.githubCallbackUrl,
}, function(accessToken, refreshToken, profile, done) {
  var user = { token: accessToken, refreshToken: refreshToken, profile: profile };
  done(null, user);
}));

module.exports = passport;

