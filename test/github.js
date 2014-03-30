var expect = require('chai').expect;
var github = require('../lib/worker/github');

var fixtures = function(name) {
  var fs = require('fs');
  var path = __dirname + '/fixtures/' + name + '.json';
  var data = fs.readFileSync(path);
  return JSON.parse(data);
};

describe('lib/worker/github', function() {

  describe('_today', function() {
    it('works', function() {
      var g = github();
      var today = g._today();
      expect(today).to.match(/^\d{4}-\d\d-\d\dT00:00:00\+00:00$/);
    });
  });

  describe('_lastMonth', function() {
    it('works', function() {
      var g = github();
      var lastMonth = g._lastMonth('2014-03-31T00:00:00+00:00');
      expect(lastMonth).to.equal('2014-02-28T00:00:00+00:00');
    });
  });

  describe('_authenticate', function() {
    it('works', function() {
      var g = github();
      var token = process.env.BWILIKE_TEST_GITHUB_TOKEN;
      g._authenticate(token);
    });
  });

  describe.skip('_fetchEvents', function() {
    it('works', function(done) {
      var g = github();
      var token = process.env.BWILIKE_TEST_GITHUB_TOKEN;
      g._authenticate(token);
      var username = process.env.BWILIKE_TEST_GITHUB_USERNAME;
      var page = 1;
      g._fetchEvents(username, page, function(err, events) {
        expect(err).to.be.null;
        expect(events).to.be.an('array');
        done();
      });
    });
  });

  describe.skip('_fetchAndFilterEvents', function() {
    it('works', function(done) {
      var g = github();
      var token = process.env.BWILIKE_TEST_GITHUB_TOKEN;
      g._authenticate(token);
      var username = process.env.BWILIKE_TEST_GITHUB_USERNAME;
      var from = '2014-03-01T00:00:00+00:00';
      var to = '2014-03-31T00:00:00+00:00';
      g._fetchAndFilterEvents(username, from, to, function(err, events) {
        expect(err).to.be.null;
        expect(events).to.be.an('array');
        done();
      });
    });
  }); 

  describe('_parseEvents', function() {
    it('works', function() {
      // => [
      //   {
      //     user: 'username',
      //     repo: 'reponame',
      //     count: 999
      //   }
      // ]
      var events = fixtures('events');
      var g = github();
      var repos = g._parseEvents(events);
      expect(repos).to.be.an('array');
      expect(repos[0]).to.have.property('user');
      expect(repos[0]).to.have.property('repo');
      expect(repos[0]).to.have.property('count');
    });
  });

  describe.skip('_fetchLanguages', function() {
    it('works', function(done) {
      var repos = fixtures('repos');
      var g = github();
      var token = process.env.BWILIKE_TEST_GITHUB_TOKEN;
      g._authenticate(token);
      g._fetchLanguages(repos, function(err, languages) {
        expect(err).to.be.null;
        expect(languages).to.be.an('array');
        expect(languages[0]).to.have.property('languages');
        done();
      })
    });
  });

  describe('_parseLanguages', function() {
    it('works', function() {
      var languages = fixtures('languages');
      var g = github();
      var parsed = g._parseLanguages(languages);
      expect(parsed).to.be.an('array');
      expect(parsed[0]).to.have.property('language');
      expect(parsed[0]).to.have.property('like');
    });
  });

});

