var RewriteMiddleware = require('../lib/htaccess');
var express = require('./helpers/express');

var expect = require('chai').expect;
var path = require('path');
var supertest = require('supertest');
var async = require('async');

var app = null;

describe('40-rewriteengine-off', function() {
  before(function (done) {
    app = express(0, RewriteMiddleware({
      verbose: false,
      file: path.resolve(__dirname, 'htaccess_files', '40-rewriteengine-off.htaccess')
    }));
    done();
  });

  after(function (done) {
    app.close();
    done();
  });

  

  it('RewriteRule ^source1.html$ /dest1.html [R]', function (done) {
    this.request = supertest(app)
     .get('/source1.html')
     .end(function (err, res) {
       expect(res.statusCode).to.equal(404);

       done();
     });
  });
});