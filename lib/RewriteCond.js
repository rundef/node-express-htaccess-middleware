'use strict';

var _ = require('lodash');


function RewriteCond(baseCondition) {
  _.assign(this, baseCondition);

  this.doMatch = true;

  if(this.pattern[0] == '!') {
    this.pattern = this.pattern.substring(1);
    this.doMatch = false;
  }

  if(this.flags.indexOf('NC') != -1) {
    this.re = new RegExp(this.pattern, 'i');
  }
  else {
    this.re = new RegExp(this.pattern);
  }
}


RewriteCond.prototype.matches = function (req) {
  var value = '';
  if(this.variable == '%{HTTP_USER_AGENT}') {
    value = req.headers['user-agent'];
  }
  else if(this.variable == '%{REQUEST_METHOD}') {
    value = req.method.toUpperCase();
  }
  else if(this.variable == '%{HTTP_REFERER}') {
    value = req.headers['referer'];
  }

  var result = this.re.exec(value);
  if(result == null && !this.doMatch) {
    return true;
  }
  else if(result != null && this.doMatch) {
    return true;
  }

  return false;
};

module.exports = RewriteCond;