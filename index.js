module.exports = process.env.BWILIKE_COV
  ? require('./lib-cov/')
  : require('./lib/');

if (!module.parent) {
  module.exports(function(err) {
    console.log(err);
  });
}
