'use strict';

var _ = require('lodash');
var url = require('url');


function RewriteCond(baseCondition) {
  _.assign(this, baseCondition);

  this.doMatch = true;
  this.envVarRegexp = /%{ENV:(.+)}$/;

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
  var envMatch = this.envVarRegexp.exec(this.variable);

  if(envMatch) {
    var envVar = envMatch[1];
    value = process.env[envVar] || '';
  }
  if(this.variable == '%{HTTP_USER_AGENT}') {
    value = req.headers['user-agent'];
  }
  else if(this.variable == '%{REQUEST_METHOD}') {
    value = req.method.toUpperCase();
  }
  else if(this.variable == '%{HTTP_REFERER}') {
    value = req.headers['referer'];
  }
  else if(this.variable == '%{HTTP_HOST}') {
    value = req.headers['host'];
  }
  else if(this.variable == '%{REQUEST_URI}') {
    value = url.parse(req.url).pathname;
  }
  else if(this.variable == '%{THE_REQUEST}') {
    value = req.url;
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