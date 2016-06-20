var express = require('express');
var RewriteMiddleware = require('../../lib/middleware');

module.exports = function(port, htaccess_file, cb) {
  var app = express();

  RewriteMiddleware({
    verbose: true,
    file: htaccess_file
  },
  function (err, middleware) {
    app.use(middleware);

    cb(null, app.listen(port), app);
  });
};