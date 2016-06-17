'use strict';

function RewriteCond(variable, value, flags) {
  this.variable = variable;
  this.value = value;
  this.flags = flags.replace('[', '').replace(']', '').split(',').map(Function.prototype.call, String.prototype.trim);
  this.doMatch = true;

  if(this.value.substring(0, 1) == '!') {
    this.value = this.value.substring(1);
    this.doMatch = false;
  }

  if(this.flags.indexOf('NC') != -1) {
    this.re = new RegExp(this.value, 'i');
  }
  else {
    this.re = new RegExp(this.value);
  }
}


RewriteCond.prototype.matches = function (req) {
  var value = '';
  if(this.variable == '%{HTTP_USER_AGENT}') {
    value = req.headers['user-agent'];
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