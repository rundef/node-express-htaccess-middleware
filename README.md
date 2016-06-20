# express-htaccess-middleware

[![npm version](https://badge.fury.io/js/express-htaccess-middleware.svg)](http://badge.fury.io/js/express-htaccess-middleware) 
[![Travis](https://travis-ci.org/rundef/node-express-htaccess-middleware.svg?branch=master)](https://travis-ci.org/rundef/node-express-htaccess-middleware?branch=master) 
[![Coverage Status](https://coveralls.io/repos/github/rundef/node-express-htaccess-middleware/badge.svg?branch=master)](https://coveralls.io/github/rundef/node-express-htaccess-middleware?branch=master)

An express middleware that interprets .htaccess rewrite rules.

## Installation

> npm i express-htaccess-middleware

## Usage

```javascript
var path = require('path');
var express = require('express');
var RewriteMiddleware = require('express-htaccess-middleware');

RewriteMiddleware({
  verbose: (process.env.ENV_NODE == 'development'),
  file: path.resolve(__dirname, '.htaccess')
},
function (err, middleware) {
  if(err) throw err;

  var app = express();
  app.use(middleware);
  app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
  });
});
```

If the *verbose* flag is set, the rules not understood by this module will be shown in the console. The redirections will also be displayed.

This is very useful to debug your redirections when developing your app.

## Supported directives

#### RewriteEngine *on|off*

The `RewriteEngine on` directive enables the rewriting engine.

#### RewriteBase *URL-path*

Sets the base URL for rewrites.

#### RewriteCond *TestVariable* *Pattern* [*Flags*]

Defines a condition under which rewriting will take place. The pattern has to be a regular expression. 

##### Supported variables

- %{REQUEST_METHOD}

- %{HTTP_USER_AGENT}

- %{HTTP_REFERER}

##### Supported flags

- NC

- OR

#### RewriteRule *Pattern* *Substitution* [*Flags*]

Defines rules for the rewriting engine

##### Supported flags

- NC

- R

- F

- G

- QSA