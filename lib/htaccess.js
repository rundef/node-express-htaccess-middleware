'use strict';

var fs = require('fs');
var chalk = require('chalk');
var _ = require('lodash');
var RewriteRule = require('./RewriteRule');
var RewriteCond = require('./RewriteCond');
var url = require('url')

function HtaccessInterpreter(options) {
  this.verbose = options.verbose || false;

  if(typeof options.file == 'undefined') {
    throw new Error('Options.file not specified');
  }

  if(!fs.statSync(options.file).isFile()) {
    throw new Error('Options.file file does not exist');
  }

  this.filePath = options.file;
  this.content = fs.readFileSync(this.filePath);

  this.content = this.content.toString().split('\n').filter(function (line) {
    var trimmed = line.trim();

    return trimmed.length > 0 && trimmed.substring(0, 1) != '#';
  });

  this.supportedVariables = [
    '%{HTTP_USER_AGENT}',
    '%{REQUEST_METHOD}',
    '%{HTTP_REFERER}',
  ];

  this.rules = [];
  this.parseHtaccessContent();

  return this.middleware.bind(this);
}


HtaccessInterpreter.prototype.parseHtaccessContent = function () {
  var RewriteEngineActivated = false;
  var RewriteBase = '/';
  var conditions = [];

  for(var i = 0; i < this.content.length; i++) {
    var line = this.content[i].trim();
    var parts = line.trim().split(' ').filter(function (part) {
      return part.length > 0;
    });

    if(parts[0] == 'RewriteEngine') {
      RewriteEngineActivated = (parts[1].toLowerCase() == 'on');
    }
    else if(parts[0] == 'RewriteBase') {
      if(RewriteEngineActivated) {
        RewriteBase = parts[1];
      }
    }
    else if(parts[0] == 'RewriteCond') {
      if(RewriteEngineActivated) {
        if(this.isVariableSupported(parts[1])) {
          var flags = typeof parts[3] == 'undefined' ? '' : parts[3];
          var condition = new RewriteCond(parts[1], parts[2], flags);
          conditions.push(condition);
        }
        else if(this.verbose) {
          console.log(chalk.yellow.bgBlack(' WARN: RewriteCond variable not supported: '+parts[1]));
        }
      }
    }
    else if(parts[0] == 'RewriteRule') {
      if(RewriteEngineActivated) {
        var flags = typeof parts[3] == 'undefined' ? '' : parts[3];
        var rule = new RewriteRule(RewriteBase, parts[1], parts[2], flags, conditions);
        this.rules.push(rule);

        conditions = [];
      }
    }
    else if(this.verbose) {
      console.log(chalk.yellow.bgBlack(' WARN: rule not understood: '+line));
    }
  }
};


HtaccessInterpreter.prototype.middleware = function (req, res, next) {
  var parsedUrl = url.parse(req.url);
  var reqUrl = parsedUrl.pathname;
  if(reqUrl[0] == '/') {
    reqUrl = reqUrl.substring(1);
  }

  for(var i = 0; i < this.rules.length; i++) {
    if(this.rules[i].conditionsMatches(req)) {
      var action = this.rules[i].matches(reqUrl);

      if(action) {
        if(action.type == 'status') {
          return res.sendStatus(action.code);
        }
        else if(action.type == 'redirect') {
          if(action.dest.substring(0, 1) != '/' && action.dest.indexOf('://') == -1) {
            action.dest = _.trimEnd(this.rules[i].base, '/') + '/' + _.trimStart(action.dest, '/');
          }
   
          if(this.verbose) {
            console.log(chalk.green.bgBlack(' Redirecting ('+action.code+') '+reqUrl+' to '+action.dest));
          }

          if(parsedUrl.query) {
            action.dest += '?' + parsedUrl.query;
          }
          
          return res.redirect(action.code, action.dest);
        }
      }
    }
  }

  next();
};


HtaccessInterpreter.prototype.isVariableSupported = function (variable) {
  return (this.supportedVariables.indexOf(variable) !== -1);
};


module.exports = function (options) {
  return (new HtaccessInterpreter(options));
};
