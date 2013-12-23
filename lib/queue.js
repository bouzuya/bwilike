var async = require('async');
var aws = require('aws-sdk');

var Queue = function() {
  this._sqs = new aws.SQS();
  this._sqsQueueName = process.env.BWILIKE_AWS_SQS_QUEUE_NAME;
  this._sqsQueueUrl = null;
  this.values = [];
};

Queue.prototype._queueUrl = function(callback) {
  if (this._sqsQueueUrl) return callback(null, this._sqsQueueUrl);
  this._sqs.getQueueUrl({
    QueueName: this._sqsQueueName
  }, function(err, data) {
    if (err) return callback(err);
    this._sqsQueueUrl = data.QueueUrl;
    callback(null, this._sqsQueueUrl);
  });
};

Queue.prototype.enqueue = function(value, callback) {
  var self = this;
  self._queueUrl(function(err, url) {
    if (err) return callback(err);
    self._sqs.sendMessage({
      QueueUrl: url,
      MessageBody: value
    }, function(err, data) {
      if (err) return callback(err);
      callback(null, value);
    });
  });
};

Queue.prototype.dequeue = function(callback) {
  if (this.values.length == 0) {
    callback(null, null);
  } else {
    callback(null, this.values.shift());
  }
};

Queue.prototype.peek = function(callback) {
  var self = this;
  self._queueUrl(function(err, url) {
    if (err) return callback(err);
    self._sqs.receiveMessage({
      QueueUrl: url,
      MaxNumberOfMessages: 1
    }, function(err, data) {
      if (err) return done(err);
      if (!data.Messages || data.Messages.length == 0) {
        callback(null, null);
      } else {
        callback(null, data.Messages[0].Body);
      }
    });
  });
};

Queue.prototype.length = function(callback) {
  var self = this;
  self._queueUrl(function(err, url) {
    if (err) return callback(err);
    self._sqs.getQueueAttributes({
      QueueUrl: url,
      AttributeNames: ['All']
    }, function(err, data) {
      if (err) return callback(err);
      callback(err, parseInt(data.Attributes.ApproximateNumberOfMessages));
    });
  });
};

Queue.prototype.clear = function(callback) {
  var self = this;
  self._queueUrl(function(err, url) {
    if (err) return callback(err);
    self._sqs.getQueueAttributes({
      QueueUrl: url,
      AttributeNames: ['All']
    }, function(err, data) {
      if (err) return callback(err);
      var n = data.Attributes.ApproximateNumberOfMessages;
      if (n == 0) return callback();
      async.times(n, function(i, next) {
        self._sqs.receiveMessage({
          QueueUrl: url,
          MaxNumberOfMessages: 1
        }, function(err, data) {
          if (err) return callback(err);
          if (data.Messages.length == 0) return next();
          self._sqs.deleteMessage({
            QueueUrl: url,
            ReceiptHandle: data.Messages[0].ReceiptHandle
          }, function(err, data) {
            next(err);
          });
        });
      }, function(err) {
        if (err) return callback(err);
        callback();
      });
    });
  });
};

module.exports = function() {
  return new Queue();
};

