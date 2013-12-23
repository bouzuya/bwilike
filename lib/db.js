var MongoClient = require('mongodb').MongoClient;
var config = require('./config');

var db;

var open = function(callback) {
  if (db) return callback(null, db);
  var url = config.mongoUrl;
  MongoClient.connect(url, function(err, d) {
    if (err) return callback(err);
    db = d;
    callback(null, db);
  });
};

var close = function() {
  if (db) db.close();
};

var users = function(callback) {
  open(function(err, db) {
    if (err) return callback(err);
    var users = db.collection('users');
    callback(null, users);
  });
};

module.exports.open = open;
module.exports.close = close;
module.exports.users = users;
