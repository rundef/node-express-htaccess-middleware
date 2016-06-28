var _ = require('lodash');
var express = require('express');
var RewriteMiddleware = require('../../lib/middleware');

module.exports = function(port, options, cb) {
  var app = express();

  var RewriteOptions = _.assign({
    verbose: false
  }, options);

  var server = app.listen(port, '127.0.0.1');

  if (RewriteOptions.watch) {
    RewriteOptions.server = server;
  }

  app.use(RewriteMiddleware(RewriteOptions));

  setTimeout(function() {
    cb(null, server, app);
  }, 100);
};