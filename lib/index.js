var async = require('async');
var express = require('express');
var lessMiddleware = require('less-middleware');
var mongodb = require('./db');
var MongoStore = require('connect-mongo')(express);
var passport = require('./passport');
var config = require('./config');

var startApp = function(callback) {
  var app = null;
  var db = null;

  var createApp = function(next) {
    app = express();
    next();
  };

  var connectMongo = function(next) {
    mongodb.open(function(err, d) {
      if (err) return next(err);
      db = d;
      next();
    });
  };

  var configureApp = function(next) {
    var port = process.env.PORT || (app.get('env') === 'production' ? 80 : 3000);
    app.set('port', port);
    app.set('view engine', 'jade');
    app.set('views', __dirname + '/../views');
    next();
  };

  var setMiddleware = function(next) {
    if (app.get('env') !== 'test') {
      app.use(express.logger());
    }
    app.use(express.compress());
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.cookieParser());
    app.use(express.session({
      secret: config.sessionSecret, 
      store: new MongoStore({ db: db })
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    app.use(lessMiddleware({
      src: 'public',
      compress: true
    }));
    app.use(express.static('public'));
    next();
  };

  var setRouting = function(next) {
    var authTwitter = passport.authenticate('twitter', {
      failureRedirect: '/'
    });
    var authGithub = passport.authenticate('github', {
      session: false,
      failureRedirect: '/'
    });
    var auth = function(req, res, next) {
      if (req.isAuthenticated()) return next();
      res.redirect('/');
    };
    app.get('/', require('./routes/index'));
    app.get('/signout', require('./routes/signout'));
    app.get('/auth/twitter', authTwitter, require('./routes/auth/twitter'));
    app.get('/auth/github', auth, authGithub, require('./routes/auth/github'));
    app.get('/status', auth, require('./routes/status'));
    next();
  };

  var startListening = function(next) {
    app.listen(app.get('port'));
  };

  var tasks = [];
  tasks.push(createApp);
  tasks.push(connectMongo);
  tasks.push(configureApp);
  tasks.push(setMiddleware);
  tasks.push(setRouting);
  tasks.push(startListening);
  async.waterfall(tasks, function(err, result) {
    callback(err, app);
  });
};

module.exports = startApp;

