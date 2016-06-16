# htaccess-rewrite-middleware

**Work in progress, do not use**

An express middleware that interprets .htaccess redirection rules.

## Installation

> npm i htaccess-rewrite-middleware

## Usage

```javascript
var path = require('path');

var express = require('express');
var htaccessRewrite = require('htaccess-rewrite-middleware');

var app = express();

app.use(htaccessRewrite({
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