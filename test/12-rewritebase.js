var RewriteMiddleware = require('../lib/htaccess');
var express = require('./helpers/express');

var expect = require('chai').expect;
var path = require('path');
var supertest = require('supertest');
var async = require('async');

var app = null;

describe('12-rewritebase', function() {
  before(function (done) {
    app = express(0, RewriteMiddleware({
      verbose: false,
      file: path.resolve(__dirname, 'htaccess_files', '12-rewritebase.htaccess')
    }));
    done();
  });

  after(function (done) {
    app.close();
    done();
  });

  

  it('RewriteRule source1.html /dest1.html [R]', function (done) {
    async.series([
      function(next) {
        this.request = supertest(app)
         .get('/dir/source1.html')
         .end(function (err, res) {
           expect(res.statusCode).to.equal(302);

           expect(res.header).to.have.property('location');
           expect(res.header.location).to.equal('/dest1.html');

           done();
         });
      }.bind(this),


      function(next) {
        this.request = supertest(app)
         .get('/source1.html')
         .end(function (err, res) {
           expect(res.statusCode).to.equal(404);

           done();
         });
      }.bind(this)
    ], done);
  });


  it('RewriteRule ^dir/source2.html$ dest2.html [R]', function (done) {
    this.request = supertest(app)
     .get('/dir/source2.html')
     .end(function (err, res) {
       expect(res.statusCode).to.equal(302);

       expect(res.header).to.have.property('location');
       expect(res.header.location).to.equal('/dir/dest2.html');

       done();
     });
  });


  it('RewriteRule ^(.*)$ http://www.domain2.com/$1 [R]', function (done) {
    async.series([
      function(next) {
        this.request = supertest(app)
         .get('/dir')
         .end(function (err, res) {
           expect(res.statusCode).to.equal(302);

           expect(res.header).to.have.property('location');
           expect(res.header.location).to.equal('http://www.domain2.com/dir');

           done();
         });
      }.bind(this),


      function(next) {
        this.request = supertest(app)
         .get('/dir/')
         .end(function (err, res) {
           expect(res.statusCode).to.equal(302);

           expect(res.header).to.have.property('location');
           expect(res.header.location).to.equal('http://www.domain2.com/dir/');

           done();
         });
      }.bind(this),


      function(next) {
        this.request = supertest(app)
         .get('/dir/test')
         .end(function (err, res) {
           expect(res.statusCode).to.equal(302);

           expect(res.header).to.have.property('location');
           expect(res.header.location).to.equal('http://www.domain2.com/dir/test');

           done();
         });
      }.bind(this)
    ], done);
  });
});