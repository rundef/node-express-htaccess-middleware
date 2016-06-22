var RewriteMiddleware = require('../lib/middleware');
var express = require('./helpers/express');

var expect = require('chai').expect;
var path = require('path');
var fs = require('fs');
var supertest = require('supertest');
var async = require('async');

var app = null;
var file = path.resolve(__dirname, 'htaccess_files', '02-watch-option.htaccess');

describe('02-watch-option', function() {
  before(function (done) {
    fs.writeFileSync(file, "RewriteEngine on\nRewriteBase /\n");
    express(0, {file: file, watch: true}, function(err, server, expressInstance) {
      app = server;
      expressInstance.on('close', function () { console.log('CLOSE'); });
      done();
    });
  });

  after(function (done) {
    fs.unlinkSync(file);
    app.close();
    done();
  });

  it('GET /source1.html should return a 404', function (done) {
    this.request = supertest(app)
     .get('/source1.html')
     .end(function (err, res) {
       expect(res.statusCode).to.equal(404);

       done();
     });
  });



  it('GET /source1.html should return a 302 after the htaccess file was modified', function (done) {
    fs.writeFileSync(file, "RewriteEngine on\nRewriteBase /\nRewriteRule source1.html dest1.html [R]");

    setTimeout(function () {
      this.request = supertest(app)
       .get('/source1.html')
       .end(function (err, res) {
         expect(res.statusCode).to.equal(302);

         expect(res.header).to.have.property('location');
         expect(res.header.location).to.equal('/dest1.html');

         done();
       });
     }.bind(this), 100);
  });
});