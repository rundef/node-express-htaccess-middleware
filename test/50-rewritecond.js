var RewriteMiddleware = require('../lib/middleware');
var express = require('./helpers/express');

var expect = require('chai').expect;
var path = require('path');
var supertest = require('supertest');
var async = require('async');

var app = null;

describe('50-rewritecond', function() {
  before(function (done) {
    express(0, path.resolve(__dirname, 'htaccess_files', '50-rewritecond.htaccess'), function(err, server) {
      app = server;
      done();
    });
  });

  after(function (done) {
    app.close();
    done();
  });

  it('HTTP_USER_AGENT', function (done) {
    this.request = supertest(app)
     .get('/source1.html')
     .set('User-Agent', 'Blacklisted-agent1')
     .end(function (err, res) {
       expect(res.statusCode).to.equal(307);

       expect(res.header).to.have.property('location');
       expect(res.header.location).to.equal('/dest1.html');

       done();
     });
  });

  it('HTTP_USER_AGENT - OR,NC flags', function (done) {
    async.series([
      function(next) {
        this.request = supertest(app)
         .get('/source2.html')
         .set('User-Agent', 'whitelisted-agent1')
         .end(function (err, res) {
           expect(res.statusCode).to.not.equal(403);

           next();
         });
      }.bind(this),


      function(next) {
        this.request = supertest(app)
         .get('/source2.html')
         .set('User-Agent', 'Blacklisted-agent1')
         .end(function (err, res) {
           expect(res.statusCode).to.equal(403);

           next();
         });
      }.bind(this),


      function(next) {
        this.request = supertest(app)
         .get('/source2.html')
         .set('User-Agent', 'Blacklisted-AGENT2')
         .end(function (err, res) {
           expect(res.statusCode).to.equal(403);

           next();
         });
      }.bind(this),
    ], done);
  });



  it('REQUEST_METHOD/HTTP_REFERER', function (done) {
    async.series([
      function(next) {
        this.request = supertest(app)
         .get('/test.html')
         .set('User-Agent', 'whitelisted-agent1')
         .set('Referer', 'http://www.otherdomain.com/page.html')
         .end(function (err, res) {
           expect(res.statusCode).to.not.equal(410);

           next();
         });
      }.bind(this),


      function(next) {
        this.request = supertest(app)
         .post('/test.html')
         .set('User-Agent', 'whitelisted-agent1')
         .set('Referer', 'http://www.olddomain.com/page.html')
         .end(function (err, res) {
           expect(res.statusCode).to.not.equal(410);

           next();
         });
      }.bind(this),


      function(next) {
        this.request = supertest(app)
         .post('/test.html')
         .set('User-Agent', 'whitelisted-agent1')
         .set('Referer', 'http://www.otherdomain.com/page.html')
         .end(function (err, res) {
           expect(res.statusCode).to.equal(410);

           next();
         });
      }.bind(this),
    ], done);
  });

/*

  it('HTTP_HOST', function (done) {
    async.series([
      function(next) {
        this.request = supertest(app)
         .get('/test.html')
         .set('User-Agent', 'whitelisted-agent1')
         .set('Host', 'www.somedomain.com')
         .end(function (err, res) {
           expect(res.statusCode).to.equal(404);

           next();
         });
      }.bind(this),


      function(next) {
        this.request = supertest(app)
         .get('/test.html')
         .set('User-Agent', 'whitelisted-agent1')
         .set('Host', 'www.olddomain.com')
         .end(function (err, res) {
           expect(res.statusCode).to.equal(301);

           expect(res.header).to.have.property('location');
           expect(res.header.location).to.equal('http://www.newdomain.com/test.html');

           next();
         });
      }.bind(this),
    ], done);
  });*/
});