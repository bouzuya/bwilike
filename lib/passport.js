var passport = require('passport');
var passportTwitter = require('passport-twitter');
var passportGithub = require('passport-github');
var config = require('./config');
var mongodb = require('./db');

// twitter settings
passport.use(new passportTwitter.Strategy({
  consumerKey: config.twitterConsumerKey,
  consumerSecret: config.twitterConsumerSecret,
  callbackURL: config.twitterCallbackUrl,
}, function(token, tokenSecret, profile, done) {
  var u = {
    id: profile.id,
    twitter: {
      id: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      token: token,
      tokenSecret: tokenSecret
    }
  };

  mongodb.users(function(err, users) {
    if (err) return done(err);
    users.findOne({
      id: u.id
    }, function(err, user) {
      if (err) return done(err);
      users.update(
        { id: u.id },
        { $set: { twitter: u.twitter } },
        { upsert: true },
        function(err) {
          if (err) return done(err);
          done(null, u);
        });
    });
  });
}));

// github settings
passport.use(new passportGithub.Strategy({
  clientID: config.githubClientId,
  clientSecret: config.githubClientSecret,
  callbackURL: config.githubCallbackUrl,
}, function(accessToken, refreshToken, profile, done) {
  var u = {
    provider: profile.provider,
    github: {
      id: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      token: accessToken,
      refreshToken: refreshToken
    }
  };

  // saving db in lib/routes/auth/github.js
  done(null, u);
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  mongodb.users(function(err, users) {
    if (err) return done(err);
    users.findOne({
      id: id
    }, function(err, user) {
      done(err, user);
    });
  });
});

module.exports = passport;

