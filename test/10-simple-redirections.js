var RewriteMiddleware = require('../lib/middleware');
var express = require('./helpers/express');

var expect = require('chai').expect;
var path = require('path');
var supertest = require('supertest');
var async = require('async');

var app = null;

describe('10-simple-redirections', function() {
  before(function (done) {
    express(0, path.resolve(__dirname, 'htaccess_files', '10-simple-redirections.htaccess'), function(err, server) {
      app = server;
      done();
    });
  });

  after(function (done) {
    app.close();
    done();
  });

  

  it('RewriteRule ^source1.html$ /dest1.html [R]', function (done) {
    this.request = supertest(app)
     .get('/source1.html')
     .end(function (err, res) {
       expect(res.statusCode).to.equal(302);

       expect(res.header).to.have.property('location');
       expect(res.header.location).to.equal('/dest1.html');

       done();
     });
  });

  it('RewriteRule ^source2.html$ /dest2.html [R=302]', function (done) {
    async.series([
      function(next) {
        this.request = supertest(app)
         .get('/source2.html')
         .end(function (err, res) {
           expect(res.statusCode).to.equal(302);

           expect(res.header).to.have.property('location');
           expect(res.header.location).to.equal('/dest2.html');

           next();
         });
      }.bind(this),


      function(next) {
        this.request = supertest(app)
         .get('/source2.html')
         .query('var1=1&var2=abcd')
         .end(function (err, res) {
           expect(res.statusCode).to.equal(302);

           expect(res.header).to.have.property('location');
           expect(res.header.location).to.equal('/dest2.html?var1=1&var2=abcd');

           next();
         });
      }.bind(this)
    ], done);
  });



  it('RewriteRule ^source3.html$ /dest3.html [R=301]', function (done) {
    this.request = supertest(app)
     .get('/source3.html')
     .end(function (err, res) {
       expect(res.statusCode).to.equal(301);

       expect(res.header).to.have.property('location');
       expect(res.header.location).to.equal('/dest3.html');

       done();
     });
  });



  it('RewriteRule ^source4.html$ /dest4.html [L,R=301]', function (done) {
    this.request = supertest(app)
     .get('/source4.html')
     .end(function (err, res) {
       expect(res.statusCode).to.equal(301);

       expect(res.header).to.have.property('location');
       expect(res.header.location).to.equal('/dest4.html');

       done();
     });
  });


  it('RewriteRule ^/source5.html$ /dest5.html [R]', function (done) {
    this.request = supertest(app)
     .get('/source5.html')
     .end(function (err, res) {
       expect(res.statusCode).to.equal(404);

       done();
     });
  });


  it('RewriteRule source6.html - [F]', function (done) {
    this.request = supertest(app)
     .get('/source6.html')
     .end(function (err, res) {
       expect(res.statusCode).to.equal(403);

       done();
     });
  });


  it('RewriteRule source7.html - [G]', function (done) {
    this.request = supertest(app)
     .get('/source7.html')
     .end(function (err, res) {
       expect(res.statusCode).to.equal(410);

       done();
     });
  });


  it('RewriteRule source8.html /dest8.html [R,NC]', function (done) {
    this.request = supertest(app)
     .get('/SOURCE8.html')
     .end(function (err, res) {
       expect(res.statusCode).to.equal(302);

       expect(res.header).to.have.property('location');
       expect(res.header.location).to.equal('/dest8.html');

       done();
     });
  });


  it('RewriteRule source-(.{1}).html /page.php?page=$1 [R]', function (done) {
    this.request = supertest(app)
     .get('/source-a.html?a=1')
     .end(function (err, res) {
       expect(res.statusCode).to.equal(302);

       expect(res.header).to.have.property('location');
       expect(res.header.location).to.equal('/page.php?page=a');

       done();
     });
  });


  it('RewriteRule source-(.{2}).html /page.php?page=$1 [R,QSA]', function (done) {
    this.request = supertest(app)
     .get('/source-aa.html?a=1')
     .end(function (err, res) {
       expect(res.statusCode).to.equal(302);

       expect(res.header).to.have.property('location');
       expect(res.header.location).to.equal('/page.php?page=aa&a=1');

       done();
     });
  });
});