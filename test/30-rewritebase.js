var RewriteMiddleware = require('../lib/middleware');
var express = require('./helpers/express');

var expect = require('chai').expect;
var path = require('path');
var supertest = require('supertest');
var async = require('async');

var app = null;

describe('30-rewritebase', function() {
  before(function (done) {
    express(0, path.resolve(__dirname, 'htaccess_files', '30-rewritebase.htaccess'), function(err, server) {
      app = server;
      done();
    });
  });

  after(function (done) {
    app.close();
    done();
  });

  

  it('RewriteRule source1.html dest1.html [R]', function (done) {
    async.series([
      function(next) {
        this.request = supertest(app)
         .get('/source1.html')
         .end(function (err, res) {
           expect(res.statusCode).to.equal(302);

           expect(res.header).to.have.property('location');
           expect(res.header.location).to.equal('/dir/dest1.html');

           done();
         });
      }.bind(this),


      function(next) {
        this.request = supertest(app)
         .get('/folder/source1.html')
         .end(function (err, res) {
           expect(res.statusCode).to.equal(302);

           expect(res.header).to.have.property('location');
           expect(res.header.location).to.equal('/dir/dest1.html');

           done();
         });
      }.bind(this)
    ], done);
  });


  it('RewriteRule ^source2.html$ dest2.html [R]', function (done) {
    async.series([
      function(next) {
        this.request = supertest(app)
         .get('/source2.html')
         .end(function (err, res) {
           expect(res.statusCode).to.equal(302);

           expect(res.header).to.have.property('location');
           expect(res.header.location).to.equal('/dir/dest2.html');

           done();
         });
      }.bind(this),


      function(next) {
        this.request = supertest(app)
         .get('/folder/source2.html')
         .end(function (err, res) {
           expect(res.statusCode).to.equal(404);

           done();
         });
      }.bind(this)
    ], done);
  });


  it('RewriteRule source3.html$ /folder/dest3.html [R]', function (done) {
    async.series([
      function(next) {
        this.request = supertest(app)
         .get('/source3.html')
         .end(function (err, res) {
           expect(res.statusCode).to.equal(302);

           expect(res.header).to.have.property('location');
           expect(res.header.location).to.equal('/folder/dest3.html');

           done();
         });
      }.bind(this),


      function(next) {
        this.request = supertest(app)
         .get('/subfolder/source3.html')
         .end(function (err, res) {
           expect(res.statusCode).to.equal(302);

           expect(res.header).to.have.property('location');
           expect(res.header.location).to.equal('/folder/dest3.html');

           done();
         });
      }.bind(this)
    ], done);
  });


  it('RewriteRule (source4.html) http://www.domain2.com/$1 [R]', function (done) {
    async.series([
      function(next) {
        this.request = supertest(app)
         .get('/source4.html')
         .end(function (err, res) {
           expect(res.statusCode).to.equal(302);

           expect(res.header).to.have.property('location');
           expect(res.header.location).to.equal('http://www.domain2.com/source4.html');

           done();
         });
      }.bind(this),


      function(next) {
        this.request = supertest(app)
         .get('/subfolder/source4.html')
         .end(function (err, res) {
           expect(res.statusCode).to.equal(302);

           expect(res.header).to.have.property('location');
           expect(res.header.location).to.equal('http://www.domain2.com/source4.html');

           done();
         });
      }.bind(this)
    ], done);
  });
});