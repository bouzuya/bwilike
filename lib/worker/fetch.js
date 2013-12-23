var async = require('async');
var moment = require('moment');
var GitHubApi = require('github');
var db = require('../db');

var fetch = function(userId, callback) {
  var from = moment.utc({
    hour: 0, minute: 0, seconds: 0, milliseconds: 0
  }).subtract('months', 1);
  getMongoToken(userId, function(err, user) {
    if (err) return callback(err);
    var github = new GitHubApi({ version: '3.0.0' });
    github.authenticate({ type: 'oauth', token: user.token });
    fetchGithubEvents(github, user.id, from, function(err, events) {
      if (err) return callback(err);
      fetchGithubLanguages(github, events, function(err, languages) {
        if (err) return callback(err);
        updateMongoLanguages(user.id, languages, function(err, result) {
          if (err) return callback(err);
          return callback();
        });
      });
    });
  });
};

var fetchGithubEvents = function(github, user, from, callback) {
  var events = [];
  var currentPage = 1;
  var cont = true;
  async.whilst(
      function() { return cont; },
      function(next) {
        var options = { user: user, page: currentPage, per_page: 99 };
        github.events.getFromUser(options, function(err, res) {
          if (err) return next(err);
          if (res.length == 0) {
            cont = false;
            return next();
          }
          var items = res.filter(function(i) {
            return moment.utc(i.created_at).isAfter(from);
          });
          currentPage++;
          events = events.concat(items);
          cont = items.length >= res.length;
          next();
        });
      },
      function(err) {
        callback(err, events);
      });
};

var fetchGithubLanguages = function(github, events, callback) {
  // format { xxx: 999 }
  var reposCount = events 
    .filter(function(i) { return i.repo; })
    .map(function(i) { return i.repo.name; })
    .reduce(function(c, i) {
      c[i] = c[i] ? c[i] + 1 : 1;
      return c;
    }, {});
  // format [{ user: xxx, repo: xxx, count: 999 }, ...]
  var repos = Object.keys(reposCount)
    .map(function(k) {
      var v = reposCount[k];
      var ks = k.split(/\//);
      return { user: ks[0], repo: ks[1], count: v };
    })
  .filter(function(i) {
    return i.user.length > 0;
  });
  // set language
  async.map(repos, function(i, callback) {
    github.repos.getLanguages({
      user: i.user,
      repo: i.repo
    }, function(err, res) {
      if (err) return callback(err);
      var langs = Object.keys(res)
      .filter(function(i) { return i !== 'meta'; });
    langs.sort(function(a, b) { return res[b] - res[a]; });
    i.language = langs[0];
    callback(err, i);
    });
  }, function(err, newRepos) {
    if (err) return callback(err);
    var langCount = newRepos.filter(function(i) {
      return i.language;
    })
    .reduce(function(o, i) {
      o[i.language] = o[i.language] ? o[i.language] + 1 : 1;
      return o;
    }, {});
    var languages = sortByCount(langCount)
      .map(function(i) { return i.toLowerCase(); });
    callback(null, languages);
  });
};

var getMongoToken = function(userId, callback) {
  db.users(function(err, users) {
    if (err) return callback(err);
    users.findOne({
      id: userId
    }, function(err, user) {
      if (err) return callback(err);
      callback(null, { id: user.github.id, token: user.github.token });
    });
  });
};

var updateMongoLanguages = function(userId, languages, callback) {
  db.users(function(err, users) {
    if (err) return callback(err);
    users.update({
      id: userId
    }, {
      $set: {
        languages: languages,
      last_fetched: moment().format()
      }
    }, {}, function(err, result) {
      if (err) return callback(err);
      callback(null, result);
    });
  });
};

var sortByCount = function(counts) {
  return Object.keys(counts).sort(function(k1, k2) {
    return counts[k2] - counts[k1];
  });
};

module.exports = fetch;
