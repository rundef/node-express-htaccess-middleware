/*
HTTP_USER_AGENT
HTTP_REFERER
HTTP_COOKIE
HTTP_FORWARDED
HTTP_HOST
HTTP_PROXY_CONNECTION
HTTP_ACCEPT
*/

var RewriteRule = require('../lib/RewriteRule');

var expect = require('chai').expect;
var path = require('path');
var express = require('express');
var supertest = require('supertest');
var port = 9999;

describe('rewrite rules', function() {
  it('simple', function (done) {
    
    var htaccessRewrite = require('../lib/htaccess');

    global.app = express();

    global.app.use(htaccessRewrite({
      verbose: true,
      file: path.resolve(__dirname, 'files', 'rewritebase.htaccess')
    }));

    global.app.listen(3000, function () {
      done();
    });
  });

  it('simple2', function (done) {
    this.request = supertest(global.app)
     .get('/dir/foo.html')
     .end(function (err, res) {
       expect(res.header).to.have.property('location');
       expect(res.header.location).to.equal('test.html');

       done();
     });
  });

  it('simple3', function (done) {
    this.request = supertest(global.app)
     .get('/dir/foo.html2')
     .end(function (err, res) {
       expect(res.header).to.not.have.property('location');

       done();
     });
  });
});