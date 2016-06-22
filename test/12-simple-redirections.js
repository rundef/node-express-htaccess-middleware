var RewriteMiddleware = require('../lib/middleware');
var express = require('./helpers/express');

var expect = require('chai').expect;
var path = require('path');
var supertest = require('supertest');
var async = require('async');

var app = null;

describe('12-simple-redirections', function() {
  before(function (done) {
    var file = path.resolve(__dirname, 'htaccess_files', '12-simple-redirections.htaccess');
    express(0, {file: file}, function(err, server, expressInstance) {
      app = server;

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
       expect(res.statusCode).to.equal(302);

       expect(res.header).to.have.property('location');
       expect(res.header.location).to.equal('/destA3.html');

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
       expect(res.statusCode).to.equal(302);

       expect(res.header).to.have.property('location');
       expect(res.header.location).to.equal('/destC2.html');

       done();
     });
  });
});