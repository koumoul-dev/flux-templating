var should = require('should');

var api = require('./api');

describe('Content negociation', function() {
  it('should return a 501 error for unsupported input', function(callback) {
    api.document('application/pdf', 'application/pdf', null, '<html><body>This is a test</body></html>',
      function(err) {
        should.exist(err);
        err.should.have.property('code', 501);
        callback();
      });
  });

  it('should return a 400 error for unsupported output', function(callback) {
    api.document('application/html', 'application/json', null, '<html><body>This is a test</body></html>',
      function(err) {
        should.exist(err);
        err.should.have.property('code', 501);
        callback();
      });
  });
});
