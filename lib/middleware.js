'use strict';

var chalk = require('chalk');
var _ = require('lodash');
var htaccessParser = require('htaccess-parser');
var url = require('url');
var fs = require('fs');
var appRoot = require('app-root-path');

var RewriteRule = require('./RewriteRule');


function HtaccessInterpreter(options) {
  this.verbose = options.verbose || false;
  this.watch = options.watch || false;

  if (typeof options.file === 'undefined') {
    throw new Error('options.file not specified');
  }

  this.file = options.file;

  this.supportedRewriteFlags = [
    'NC',
    'R',
    'N',
    'L',
    /^R=(\d{3})$/,
    'F',
    'G',
    'QSA',
    'QSD',
    /^S=(\d+)$/,
  ];

  this.supportedCondVariables = [
    '%{HTTP_USER_AGENT}',
    '%{REQUEST_METHOD}',
    '%{HTTP_REFERER}',
    '%{HTTP_HOST}',
    '%{REQUEST_URI}',
    '%{THE_REQUEST}',
    '%{QUERY_STRING}',
    /%{ENV:(.+)}$/,
  ];

  this.supportedCondFlags = [
    'NC',
    'OR',
  ];

  if (this.watch) {
    this.fileWatcher = fs.watch(this.file, function () {
      if (this.verbose) {
        console.log(chalk.yellow.bgBlack(' .htaccess file has been modified, reloading the rules'));
      }
      this.parseFile();
    }.bind(this));

    if (options.server) {
      options.server.on('close', function () {
        if (this.verbose) {
          console.log(chalk.yellow.bgBlack(' unwatching .htaccess file'));
        }
        this.fileWatcher.close();
      }.bind(this));
    } else if (this.verbose) {
      console.log(chalk.white.bgRed(' WARN: option.server not specified - won\'t be able to unwatch the htaccess file when the server closes'));
    }
  }

  this.parseFile();

  return this.middleware.bind(this);
}


HtaccessInterpreter.prototype.parseFile = function () {
  this.RewriteBase = appRoot.path + '/';
  this.RewriteBaseSet = false;
  this.rules = [];

  htaccessParser({
    file: this.file
  },
  function (err, parsedFile) {
    if (err) {
      if (this.verbose) {
        console.log(chalk.white.bgRed(' ERROR: htaccess parser error', err));
      }
      return;
    }

    if (typeof parsedFile.RewriteBase !== 'undefined') {
      this.RewriteBase = parsedFile.RewriteBase;
      this.RewriteBaseSet = true;
    }

    for (var i = 0; i < parsedFile.RewriteRules.length; i++) {
      var rule = parsedFile.RewriteRules[i];
      var acceptRule = this.rewriteFlagsSupported(rule) +
        this.conditionsVariablesSupported(rule.conditions) +
        this.conditionsFlagsSupported(rule.conditions);

      if (acceptRule === 3) {
        this.rules.push(new RewriteRule(rule));
      }
    }
  }.bind(this));
};


HtaccessInterpreter.prototype.rewriteFlagsSupported = function (rule) {
  var allSupported = true;

  for (var j = 0; j < rule.flags.length; j++) {
    var isSupported = false;

    for (var k = 0; k < this.supportedRewriteFlags.length; k++) {
      var supportedFlag = this.supportedRewriteFlags[k];

      if (supportedFlag instanceof RegExp) {
        if (supportedFlag.exec(rule.flags[j])) {
          isSupported = true;
          break;
        }
      } else if (supportedFlag === rule.flags[j]) {
        isSupported = true;
        break;
      }
    }

    /* istanbul ignore if */
    if (!isSupported) {
      allSupported = false;
      if (this.verbose) {
        console.log(chalk.white.bgRed(' WARN: RewriteRule flag not supported: ' + rule.flags[j]));
      }
    }
  }

  return allSupported;
};


HtaccessInterpreter.prototype.conditionsVariablesSupported = function (conditions) {
  var allSupported = true;

  for (var j = 0; j < conditions.length; j++) {
    var isSupported = false;

    for (var k = 0; k < this.supportedCondVariables.length; k++) {
      var supportedVar = this.supportedCondVariables[k];

      if (supportedVar instanceof RegExp) {
        if (supportedVar.exec(conditions[j].variable)) {
          isSupported = true;
          break;
        }
      } else if (supportedVar === conditions[j].variable) {
        isSupported = true;
        break;
      }
    }

    /* istanbul ignore if */
    if (!isSupported) {
      allSupported = false;
      if (this.verbose) {
        console.log(chalk.white.bgRed(' WARN: RewriteCond variable not supported: ' + conditions[j].variable));
      }
    }
  }

  return allSupported;
};


HtaccessInterpreter.prototype.conditionsFlagsSupported = function (conditions) {
  var allSupported = true;

  for (var i = 0; i < conditions.length; i++) {
    for (var j = 0; j < conditions[i].flags.length; j++) {
      var isSupported = false;
      var flag = conditions[i].flags[j];

      for (var k = 0; k < this.supportedCondFlags.length; k++) {
        var supportedFlag = this.supportedCondFlags[k];

        if (supportedFlag === flag) {
          isSupported = true;
          break;
        }
      }

      /* istanbul ignore if */
      if (!isSupported) {
        allSupported = false;
        if (this.verbose) {
          console.log(chalk.white.bgRed(' WARN: RewriteCond flag not supported: ' + flag));
        }
      }
    }
  }

  return allSupported;
};


HtaccessInterpreter.prototype.middleware = function (req, res, next) {
  var parsedUrl = url.parse(req.url);
  var reqUrl = parsedUrl.pathname;
  if (reqUrl[0] === '/') {
    reqUrl = reqUrl.substring(1);
  }

  for (var i = 0; i < this.rules.length; i++) {
    var rule = this.rules[i];

    if (rule.conditionsMatches(req)) {
      var action = rule.matches(reqUrl);

      if (action) {
        if (action.type === 'status') {
          if (this.verbose) {
            console.log(chalk.blue.bgBlack(' Sending status ' + action.code + ' - requested URL is ' + reqUrl));
          }

          return res.sendStatus(action.code);
        } else if (action.type === 'content') {
          if (action.dest[0] !== '/' && action.dest.indexOf('://') === -1) {
            action.dest = _.trimEnd(this.RewriteBase, '/') + '/' + _.trimStart(action.dest, '/');
          }

          req.url = action.dest;

          return this.middleware(req, res, next);
        } else if (action.type === 'skip') {
          if (action.dest !== '-') {
            req.url = reqUrl = action.dest;
          }

          i += (action.count);
          continue;
        } else if (action.type === 'redirect') {
          if (action.dest[0] !== '/' && action.dest.indexOf('://') === -1) {
            action.dest = _.trimEnd(this.RewriteBase, '/') + '/' + _.trimStart(action.dest, '/');

            if (!this.RewriteBaseSet) {
              action.dest = req.protocol + '://' + req.headers.host + action.dest;
            }
          }

          if (this.verbose) {
            console.log(chalk.green.bgBlack(' Redirecting (' + action.code + ') ' + reqUrl + ' to ' + action.dest));
          }

          var parsedDest = url.parse(action.dest);
          if (parsedUrl.query && rule.flags.indexOf('QSD') === -1 && (!parsedDest.query || rule.flags.indexOf('QSA') !== -1)) {
            action.dest += (parsedDest.query ? '&' : '?') + parsedUrl.query;
          }

          return res.redirect(action.code, action.dest);
        }
      }
    }
  }

  return next();
};


module.exports = function (options) {
  return (new HtaccessInterpreter(options));
};
