var express = require('express');

module.exports = function(port, middleware) {
  var app = express();

  if(middleware) {
    app.use(middleware);
  }
  
  return app.listen(port);
};