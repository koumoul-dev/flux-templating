var should = require('should');

var api = require('./api');

describe('PDF converter', function() {
  it('should apply a PDF conversion to a HTML input', function(callback) {
    api.document('text/html', 'application/pdf', null, '<html><body>This is a test</body></html>',
      function(err) {
        should.not.exist(err);
        // A way to check the content ?
        callback();
      });
  });

  //TODO: make this test work. I can't find an input that makes pdf-html fail
  it.skip('should return an error for invalid HTML input', function(callback) {
    api.document('text/html', 'application/pdf', null, '<test',
      function(err) {
        should.exist(err);
        err.should.have.property('code', 500);
        callback();
      });
  });

  it('should apply a PDF conversion to the result of a handlebars template', function(callback) {
    api.document('application/json', 'application/pdf', 'hello_world.html', {
      who: 'World'
    }, function(err) {
      should.not.exist(err);
      // A way to check the content ?
      callback();
    });
  });
});
