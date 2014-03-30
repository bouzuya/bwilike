var async = require('async');
var moment = require('moment');
var GitHubApi = require('github');

var GitHub = function() {};

GitHub.prototype._today = function() {
  var today = moment.utc({
    hour: 0, minute: 0, seconds: 0, milliseconds: 0
  });
  return today.format();
};

GitHub.prototype._lastMonth = function(today) {
  return moment.utc(today).subtract('months', 1).format();
};

GitHub.prototype._authenticate = function(token) {
  this.github = new GitHubApi({ version: '3.0.0' });
  this.github.authenticate({ type: 'oauth', token: token });
};

GitHub.prototype._fetchEvents = function(username, page, callback) {
  var options = { user: username, page: page, per_page: 99 };
  this.github.events.getFromUser(options, callback);
};

GitHub.prototype._fetchAndFilterEvents = function(username, from, to, callback) {
  from = moment.utc(from);
  to = moment.utc(to);
  var result = [];
  var f = function(page) {
    this._fetchEvents(username, page, function(err, events) {
      if (err) {
        return callback(err, result);
      }

      // filter events by from and to
      if (events.length === 0) {
        return callback(null, result);
      }

      var lastEvent = events[events.length - 1];
      var lastEventCreatedAt = moment.utc(lastEvent.created_at);
      if (lastEventCreatedAt.isAfter(to)) {
        return f(page + 1);
      }

      var filteredEvents = events.filter(function(event) {
        return event.public;
      }).filter(function(event) {
        return ((event.type === 'CreateEvent') ||
                // TODO:
                // (event.type === 'GistEvent') ||
                (event.type === 'PushEvent') ||
                (event.type === 'PullRequestEvent'));
      }).filter(function(event) {
        var at = moment.utc(event.created_at);
        return (at.isBefore(to) && at.isAfter(from));
      });

      result = result.concat(filteredEvents);

      if (lastEventCreatedAt.isAfter(from)) {
        f(page + 1);
      } else {
        callback(null, result);
      }
    });
  }.bind(this);

  f(1);
};

GitHub.prototype._parseEvents = function(events, callback) {
  // => { 'reponame': 999 }
  var reposCount = events 
  .filter(function(i) { return i.repo; })
  .map(function(i) { return i.repo.name; })
  .reduce(function(c, i) {
    c[i] = c[i] ? c[i] + 1 : 1;
    return c;
  }, {});

  // => [{ user: 'username', repo: 'reponame', count: 999 }, ...]
  var repos = Object.keys(reposCount)
  .map(function(k) {
    var v = reposCount[k];
    var ks = k.split('/');
    return { user: ks[0], repo: ks[1], count: v };
  })
  .filter(function(i) {
    return i.user.length > 0;
  });

  return repos;
};

GitHub.prototype._fetchLanguages = function(repos, callback) {
  var sortByCount = function(counts) {
    return Object.keys(counts).sort(function(k1, k2) {
      return counts[k2] - counts[k1];
    });
  };

  var github = this.github;
  async.mapSeries(repos, function(repo, next) {
    github.repos.getLanguages({
      user: repo.user,
      repo: repo.repo
    }, function(err, res) {
      if (err && err.code === 404) {
        repo.language = null;
        next(null, repo);
        return;
      }
      if (err) return next(err);
      delete res.meta;
      repo.languages = res;
      next(null, repo);
    });
  }, function(err, repos) {
    if (err) return callback(err, []);
    callback(null, repos);
  });
};

GitHub.prototype._parseLanguages = function(repos) {
  var repos = repos.map(function(repo) {
    var langs = repo.languages || {};
    var total = Object.keys(langs).reduce(function(total, key) {
      return total + langs[key];
    }, 0);
    var percentage = Object.keys(langs)
    .reduce(function(result, key) {
      result[key] = langs[key] / total;
      return result;
    }, {});
    return percentage;
  }.bind(this));

  var langs = repos.reduce(function(result, langs) {
    Object.keys(langs).forEach(function(oldKey) {
      var newKey = oldKey.toLowerCase();
      if (!result[newKey]) {
        result[newKey] = 0;
      }
      result[newKey] += langs[oldKey];
    });
    return result;
  }, {});

  var likes = Object.keys(langs).map(function(key) {
    return { language: key, like: langs[key] };
  });

  var total = likes.reduce(function(total, lang) {
    return total + lang.like;
  }, 0);

  likes.forEach(function(lang) {
    lang.like = lang.like / total;
  });

  likes.sort(function(a, b) {
    return b.like - a.like;
  });

  return likes;
};

GitHub.prototype.fetch = function(token, username, callback) {
  var to = this._today();
  var from = this._lastMonth(to);
  this._authenticate(token);
  this._fetchAndFilterEvents(username, from, to, function(err, events) {
    if (err) {
      return callback(err, []);
    }

    var repos = this._parseEvents(events);
    this._fetchLanguages(repos, function(err, languages) {
      if (err) {
        return callback(err, []);
      }

      var likes = this._parseLanguages(languages);
      callback(null, likes);
    }.bind(this));
  }.bind(this));
};

module.exports = function() {
  return new GitHub();
};

