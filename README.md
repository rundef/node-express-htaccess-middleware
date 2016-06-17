# htaccess-rewrite-middleware

[![npm version](https://badge.fury.io/js/htaccess-rewrite-middleware.svg)](http://badge.fury.io/js/htaccess-rewrite-middleware) 
[![Travis](https://travis-ci.org/rundef/node-htaccess-rewrite-middleware.svg?branch=master)](https://travis-ci.org/rundef/node-htaccess-rewrite-middleware?branch=master) 
[![Coverage Status](https://coveralls.io/repos/github/rundef/node-htaccess-rewrite-middleware/badge.svg?branch=master)](https://coveralls.io/github/rundef/node-htaccess-rewrite-middleware?branch=master)

**Work in progress, do not use**

An express middleware that interprets .htaccess redirection rules.

## Installation

> npm i htaccess-rewrite-middleware

## Usage

```javascript
var path = require('path');

var express = require('express');
var RewriteMiddleware = require('../lib/htaccess');

var app = express();

app.use(RewriteMiddleware({
  verbose: (process.env.ENV_NODE == 'development'),
  file: path.resolve(__dirname, '.htaccess')
}));

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
```

If the *verbose* flag is set, the rules not understood by this module will be shown in your console. The redirections will also be displayed.

This is very useful to debug your redirections when developing.

## Supported directives

### RewriteEngine

### RewriteBase

### RewriteCond

### RewriteRule

#### Supported flags

[R=301] or [R=302]