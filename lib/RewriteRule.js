'use strict';

function RewriteRule(base, source, dest, flags, conditions) {
  this.base = base;
  this.source = source;
  this.dest = dest;
  this.flags = flags.replace('[', '').replace(']', '').split(',').map(Function.prototype.call, String.prototype.trim);
  this.conditions = conditions;

  if(this.flags.indexOf('NC') != -1) {
    this.re = new RegExp(this.source, 'i');
  }
  else {
    this.re = new RegExp(this.source);
  }
}


RewriteRule.prototype.conditionsMatches = function (req) {
  var state = {
    currentIsOr: false,
    prevWasOr: false,
    orConditionMet: false
  };


  for(var i = 0; i < this.conditions.length; i++) {
    state.currentIsOr = (this.conditions[i].flags.indexOf('OR') != -1);

    // one of the OR condition has been met
    if(state.prevWasOr && state.orConditionMet) {
      state.prevWasOr = state.currentIsOr;
      state.orConditionMet = (state.currentIsOr ? true : false);
      continue;
    }

    // condition isn't met
    if(this.conditions[i].matches(req) == false) {
      if(state.currentIsOr) {
        continue;
      }
      else {
        return false;
      }
    }
    else if (state.currentIsOr) {
      state.orConditionMet = true;
      state.prevWasOr = state.currentIsOr;
    }
  }

  return true;
};

RewriteRule.prototype.baseMatches = function (url) {
  if(url.indexOf(this.base) !== 0) {
    return null;
  }

  return url.substring(this.base.length);
};


RewriteRule.prototype.matches = function (url) {
  var result = this.re.exec(url);

  if(result == null) {
    return null;
  }

  var statusCode = this.getStatusCode();
  if(statusCode > 0) {
    return { type: 'status', code: statusCode };
  }


  var dest = this.dest;
  for(var i = 1; typeof result[i] != 'undefined'; i++) {
    var replaceRegexp = new RegExp('\\$' + i, 'g');

    dest = dest.replace(replaceRegexp, result[i]);
  }

  statusCode = this.getRedirectStatusCode();
  return { type: 'redirect', code: statusCode, dest: dest };
};


RewriteRule.prototype.getRedirectStatusCode = function () {
  if(this.flags.indexOf('R=301') != -1) {
    return 301;
  }

  return 302;
};


RewriteRule.prototype.getStatusCode = function () {
  if(this.flags.indexOf('F') != -1) {
    return 403;
  }
  else if(this.flags.indexOf('G') != -1) {
    return 410;
  }

  return 0;
};


module.exports = RewriteRule;