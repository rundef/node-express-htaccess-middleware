var RewriteMiddleware = require('../lib/middleware');
var express = require('./helpers/express');

var expect = require('chai').expect;
var path = require('path');
var supertest = require('supertest');
var async = require('async');

var app = null;
var host = null;

describe('30-rewritebase', function() {
  before(function (done) {
    var file = path.resolve(__dirname, 'htaccess_files', '31-no-rewritebase.htaccess');
    express(0, {file: file}, function(err, server) {
      app = server;
      host = 'http://' + server.address().address + ':' + server.address().port;
      done();
    });
  });

  after(function (done) {
    app.close();
    done();
  });

  
  it('RewriteRule index1\.html index2.html [R]', function (done) {
    this.request = supertest(app)
     .get('/index1.html')
     .end(function (err, res) {
       expect(res.statusCode).to.equal(302);

       var filePath = path.resolve(__dirname, '..', 'index2.html');

       expect(res.header).to.have.property('location');
       expect(res.header.location).to.equal(host + filePath);

       done();
     });
  });


  it('RewriteRule index5\\.html http://google.com [R]', function (done) {
    this.request = supertest(app)
     .get('/index5.html')
     .end(function (err, res) {
       expect(res.statusCode).to.equal(302);

       expect(res.header).to.have.property('location');
       expect(res.header.location).to.equal('http://google.com');

       done();
     });
  });


  it('RewriteRule index6\\.html /index7.html [R]', function (done) {
    this.request = supertest(app)
     .get('/index6.html')
     .end(function (err, res) {
       expect(res.statusCode).to.equal(302);

       expect(res.header).to.have.property('location');
       expect(res.header.location).to.equal('/index7.html');

       done();
     });
  });
});