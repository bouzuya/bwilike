var aws = require('aws-sdk');
var async = require('async');
var fetch = require('./worker/fetch');
var update = require('./worker/update');
var mongodb = require('./db');
var config = require('./config');

var fetchAndUpdate = function(userId, callback) {
  fetch(userId, function(err, languages) {
    if (err) return callback(err);
    updateMongoLanguages(userId, languages, function(err, result) {
      if (err) return callback(err);
      update(userId, function(err) {
        callback(err);
        mongodb.close();
      });
    });
  });
};

var updateMongoLanguages = function(userId, languages, callback) {
  mongodb.users(function(err, users) {
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

var dequeue = function(callback) {
  var sqs = new aws.SQS();
  sqs.receiveMessage({
    QueueUrl: config.awsSqsQueueUrl,
    MaxNumberOfMessages: 5
  }, function(err, message) {
    if (err) return callback(err);
    if (!message.Messages || message.Messages.length === 0) {
      return callback();
    }
    async.eachSeries(message.Messages, function(m, next) {
      var userId = m.Body;
      fetchAndUpdate(userId, function(err) {
        if (err) {
          console.error(err);
          // has error but delete message
        }
        sqs.deleteMessage({
          QueueUrl: config.awsSqsQueueUrl,
          ReceiptHandle: m.ReceiptHandle
        }, function(err) {
          if (err) {
            console.error(err);
          }
          next(); // do nothing
        });
      });
    }, function() {
      callback();
    });
  });
};

var enqueue = function(userId, callback) {
  var sqs = new aws.SQS();
  sqs.sendMessage({
    QueueUrl: config.awsSqsQueueUrl,
    MessageBody: userId 
  }, callback);
};

var enqueueAll = function(callback) {
  mongodb.users(function(err, users) {
    if (err) return callback(err);
    var cursor = users.find({});
    cursor.toArray(function(err, us) {
      if (err) return callback(err);
      async.eachSeries(us, function(u, next) {
        enqueue(u.id, function(err) {
          if (err) {
            console.log(err); // do nothing
          }
          next();
        });
      }, function(err) {
        mongodb.close();
        callback(err);
      });
    });
  });
};

if (!module.parent) {
  var args = process.argv.splice(2);
  if (args.length == 0) {
    console.log(new Error('node worker [command] [options]'));
    process.exit(1);
    return;
  }

  var commands = {
    enqueueAll: enqueueAll,
    dequeue: dequeue
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

