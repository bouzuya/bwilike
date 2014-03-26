var aws = require('aws-sdk');
var async = require('async');
var fetch = require('./worker/fetch');
var update = require('./worker/update');
var mongodb = require('./db');
var config = require('./config');

var fetchAndUpdate = function(userId, callback) {
  fetch(userId, function(err) {
    if (err) return callback(err);
    update(userId, function(err) {
      callback(err);
      mongodb.close();
    });
  });
};

var dequeue = function(callback) {
  var sqs = new aws.SQS();
  sqs.receiveMessage({
    QueueUrl: config.awsSqsQueueUrl,
    MaxNumberOfMessages: 1
  }, function(err, message) {
    if (err) return callback(err);
    if (!message.Messages || message.Messages.length === 0) {
      return callback();
    }
    var m = message.Messages[0];
    var userId = m.Body;
    fetchAndUpdate(userId, function(err) {
      if (err) return callback(err);
      sqs.deleteMessage({
        QueueUrl: config.awsSqsQueueUrl,
        ReceiptHandle: m.ReceiptHandle
      }, function(err) {
        callback(err);
      });
    });
  });
};

var enqueueAll = function(callback) {
  mongodb.users(function(err, users) {
    if (err) return callback(err);
    var cursor = users.find({});
    cursor.toArray(function(err, us) {
      if (err) return callback(err);
      var sqs = new aws.SQS();
      async.forEach(us, function(u, next) {
        sqs.sendMessage({
          QueueUrl: config.awsSqsQueueUrl,
          MessageBody: u.id 
        }, function(err, data) {
          next(err);
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

