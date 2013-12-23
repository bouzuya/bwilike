var fetch = require('./worker/fetch');
var update = require('./worker/update');
var mongodb = require('./db');

var fetchAndUpdate = function(userId, callback) {
  fetch(userId, function(err) {
    if (err) return callback(err);
    update(userId, function(err) {
      callback(err);
      mongodb.close();
    });
  });
};

module.exports.fetch = fetch;
module.exports.update = update;
module.exports.fetchAndUpdate = fetchAndUpdate;
