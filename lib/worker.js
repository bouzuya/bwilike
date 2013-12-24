var fetch = require('./worker/fetch');
var update = require('./worker/update');
var mongodb = require('./db');

var fetchAndUpdate = function(username, callback) {
  fetch(username, function(err) {
    if (err) return callback(err);
    update(username, function(err) {
      callback(err);
      mongodb.close();
    });
  });
};

var enqueueAll = function(callback) {
  mongodb.users(function(err, users) {
    if (err) return callback(err);
    users.find(function(err, us) {
      if (err) return callback(err);
      async.forEach(us, function(u, next) {
        enqueue(u.id, next);
      }, function(err) {
        callback(err);
      });
    });
  });
};

module.exports.fetch = fetch;
module.exports.update = update;
module.exports.fetchAndUpdate = fetchAndUpdate;

if (!module.parent) {
  var args = process.argv.splice(2);
  if (args.length == 0) {
    console.log(new Error('node worker [command] [options]'));
    process.exit(1);
    return;
  }

  var commands = {
    fetchAndUpdate: fetchAndUpdate
  };
  var commandName = args[0];
  var options = args.splice(1);
  options.push(function(err) {
    if (err) throw err;
  });
  var command = commands[commandName];
  if (!command) {
    console.log('command "' + commandName + '" does not exist');
    process.exit(1);
    return;
  }

  command.apply(this, options);
}

