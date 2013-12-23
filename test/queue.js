var expect = require('expect.js');
var queue = require('../lib/queue');

describe('queue', function() {

  describe('when empty', function() {
    var q;

    beforeEach(function(done) {
      q = queue();
      q.clear(function(err) {
        done(err);
      });
    });

    describe('length', function() {
      it('should be 0', function(done) {
        q.length(function(err, value) {
          expect(err).to.not.be.ok();
          expect(value).to.be(0);
          done();
        });
      });
    });

    describe('peek', function() {
      it('return null', function(done) {
        q.peek(function(err, value) {
          expect(err).to.not.be.ok();
          expect(value).to.be.eql(null);
          done();
        });
      });
    });

    describe('dequeue', function() {
      it('return null', function(done) {
        q.dequeue(function(err, value) {
          expect(err).to.not.be.ok();
          expect(value).to.eql(null);
          done();
        });
      });
    });
  });

  describe('when 1 item ["foo"]', function() {
    var q;
    var message = 'foo';

    beforeEach(function(done) {
      q = queue();
      q.clear(function(err) {
        if (err) return done(err);
        q.enqueue(message, function(err, value) {
          expect(err).to.not.be.ok();
          expect(value).to.be.eql(message);
          done();
        });
      });
    });

    describe('length', function() {
      it('return 1', function(done) {
        q.length(function(err, value) {
          expect(err).to.not.be.ok();
          expect(value).to.be(1);
          done();
        });
      });
    });

    describe('peek', function() {
      it('return "foo"', function(done) {
        q.peek(function(err, value) {
          expect(err).to.not.be.ok();
          expect(value).to.be(message);
          done();
        });
      });
    });

    describe('dequeue', function() {
      it('return "foo"', function(done) {
        q.dequeue(function(err, value) {
          expect(err).to.not.be.ok();
          expect(value).to.be(message);
          done();
        });
      });
    });
    describe('dequeue > peek', function() {
      it('return null', function(done) {
        q.dequeue(function(err, value) {
          expect(err).to.not.be.ok();
          expect(value).to.be(message);
          q.peek(function(err, value) {
            expect(err).to.not.be.ok();
            expect(value).to.be(null);
            done();
          });
        });
      });
    });

  });

  describe('when 2 items ["foo", "bar"]', function() {
    var q;
    var message1 = 'foo';
    var message2 = 'bar';

    beforeEach(function(done) {
      q = queue();
      q.enqueue(message1, function(err, value) {
        expect(err).to.not.be.ok();
        expect(value).to.be.eql(message1);
        q.enqueue(message2, function(err, value) {
          expect(err).to.not.be.ok();
          expect(value).to.be.eql(message2);
          done();
        });
      });
    });

    describe('length', function() {
      it('return 2', function(done) {
        q.length(function(err, value) {
          expect(err).to.not.be.ok();
          expect(value).to.be(2);
          done();
        });
      });
    });

    describe('peek', function() {
      it('return "foo"', function(done) {
        q.peek(function(err, value) {
          expect(err).to.not.be.ok();
          expect(value).to.be(message1);
          done();
        });
      });
    });

    describe('dequeue', function() {
      it('return "foo"', function(done) {
        q.dequeue(function(err, value) {
          expect(err).to.not.be.ok();
          expect(value).to.be(message1);
          done();
        });
      });
    });

    describe('dequeue > peek', function() {
      it('return "bar"', function(done) {
        q.dequeue(function(err, value) {
          expect(err).to.not.be.ok();
          expect(value).to.be(message1);
          q.peek(function(err, value) {
            expect(err).to.not.be.ok();
            expect(value).to.be(message2);
            done();
          });
        });
      });
    });

    describe('dequeue > dequeue > peek', function() {
      it('return null', function(done) {
        q.dequeue(function(err, value) {
          expect(err).to.not.be.ok();
          expect(value).to.be(message1);
          q.dequeue(function(err, value) {
            expect(err).to.not.be.ok();
            expect(value).to.be(message2);
            q.peek(function(err, value) {
              expect(err).to.not.be.ok();
              expect(value).to.eql(null);
              done();
            });
          });
        });
      });
    });
  });

});


