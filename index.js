var express = require('express');

var app = express();

app.configure(function() {
  app.use(express.logger());
  app.use(express.compress());
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(app.router);
  app.use(express.static('public'));
});

app.listen(3000);

