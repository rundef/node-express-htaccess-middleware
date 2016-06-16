'use strict';

function RewriteCond(variable, value, flag) {
  this.variable = variable;
  this.value = value;
  this.flag = flag;
}


RewriteCond.prototype.matches = function (req) {
  return false;
};

module.exports = RewriteCond;