var RewriteRule = require('../lib/RewriteRule');

var expect = require('chai').expect;

describe('01-url-patterns', function() {
  it('simple', function (done) {
    var rule = new RewriteRule('/', '^foo.html$', 'test.html', '');

    expect(rule.matches('test.html')).to.be.null;
    expect(rule.matches('/foo.html?a=1')).to.be.null;
    expect(rule.matches('foo.html?a=1')).to.be.null;
    expect(rule.matches('foo.html').dest).to.be.equal('test.html');

    done();
  });


  it('with variables', function (done) {
    var rule = new RewriteRule('/', '^article-([0-9]+)-([0-9]+)\\.html$', '/articles/article.php?id=$1&cat=$2', '');

    expect(rule.matches('article-a-a.html')).to.be.null;
    expect(rule.matches('article-1-2.html').dest).to.be.equal('/articles/article.php?id=1&cat=2');
    expect(rule.matches('article-34567-987654.html').dest).to.be.equal('/articles/article.php?id=34567&cat=987654');

    done();
  });


  it('with variables #2', function (done) {
    var rule = new RewriteRule('/', '^article-([0-9]+)-([0-9]+)\\.html$', '/articles/article.php?id=$1&cat=$2&catid=$2', '');

    expect(rule.matches('article-1-2.html').dest).to.be.equal('/articles/article.php?id=1&cat=2&catid=2');
    expect(rule.matches('article-34567-987654.html').dest).to.be.equal('/articles/article.php?id=34567&cat=987654&catid=987654');

    done();
  });
});
