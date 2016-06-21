var RewriteMiddleware = require('../lib/middleware');
var express = require('./helpers/express');

var expect = require('chai').expect;
var path = require('path');
var supertest = require('supertest');
var async = require('async');

var app = null;

describe('11-simple-redirections', function() {
  before(function (done) {
    express(0, path.resolve(__dirname, 'htaccess_files', '11-simple-redirections.htaccess'), function(err, server, expressInstance) {
      app = server;

      expressInstance.get('/dest1.html', function (req, res) {
        res.send('content of dest1.html');
      });

      done();
    });
  });

  after(function (done) {
    app.close();
    done();
  });


  it('1st set of rules', function (done) {
    this.request = supertest(app)
     .get('/source1.html')
     .end(function (err, res) {
       expect(res.statusCode).to.equal(200);

       expect(res.text).to.equal('content of dest1.html');

       done();
     });
  });


  it('2nd set of rules', function (done) {
    this.request = supertest(app)
     .get('/source2.html')
     .end(function (err, res) {
       expect(res.statusCode).to.equal(302);

       expect(res.header).to.have.property('location');
       expect(res.header.location).to.equal('/destA3.html');

       done();
     });
  });


  it('3rd set of rules', function (done) {
    this.request = supertest(app)
     .get('/source3.html')
     .end(function (err, res) {
       expect(res.statusCode).to.equal(200);

       expect(res.text).to.equal('content of dest1.html');

       done();
     });
  });


  it('4th set of rules', function (done) {
    this.request = supertest(app)
     .get('/source4.html')
     .end(function (err, res) {
       expect(res.statusCode).to.equal(302);

       expect(res.header).to.have.property('location');
       expect(res.header.location).to.equal('/destA3.html');

       done();
     });
  });


  it('5th set of rules', function (done) {
    this.request = supertest(app)
     .get('/source5.html')
     .end(function (err, res) {
       expect(res.statusCode).to.equal(302);

       expect(res.header).to.have.property('location');
       expect(res.header.location).to.equal('/destB1.html');

       done();
     });
  });
});