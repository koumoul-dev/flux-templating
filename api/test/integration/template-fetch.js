var should = require('should');

var api = require('./api');

describe('Template fetch', function() {
  it('should fetch template from URL', function(callback) {
    api.document('application/json', 'text/plain', 'http://localhost:3111/resources/hello_world.txt', {
      who: 'World'
    }, function(err, result) {
      should.not.exist(err);
      result.should.equal('Hello World !\n');
      callback();
    });
  });

  it('should transfer HTTP error status code', function(callback) {
    api.document('application/json', 'text/plain', 'http://localhost:3111/resources/NOT_A_TEMPLATE.txt', {
      who: 'World'
    }, function(err) {
      should.exist(err);
      err.code.should.equal(404);
      callback();
    });
  });
});
