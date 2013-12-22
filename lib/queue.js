
var Queue = function() {
  this.values = [];
};

Queue.prototype.enqueue = function(value, callback) {
  this.values.push(value);
  callback(null, value);
};

Queue.prototype.dequeue = function(callback) {
  if (this.values.length == 0) {
    callback(null, null);
  } else {
    callback(null, this.values.shift());
  }
};

Queue.prototype.peek = function(callback) {
  callback(null, this.values.length > 0 ? this.values[0] : null);
};

Queue.prototype.length = function(callback) {
  callback(null, this.values.length);
};

module.exports = function() {
  return new Queue();
};

