var should = require('should');

var api = require('./api');

describe('Handlebars templater', function() {
  it('should apply a handlebars template to JSON data', function(callback) {
    api.document('application/json', 'text/plain', 'hello_world.txt', {
      who: 'World'
    }, function(err, result) {
      should.not.exist(err);
      result.should.equal('Hello World !\n');
      callback();
    });
  });

  it('should get a 404 for missing template', function(callback) {
    api.document('application/json', 'text/plain', 'this_does_not_exist.txt', {
      who: 'World'
    }, function(err) {
      should.exist(err);
      err.should.have.property('code', 404);
      callback();
    });
  });

  it('should get a 400 for bad JSON input', function(callback) {
    api.document('application/json', 'text/plain', 'hello_world.txt', 'this is not JSON', function(err) {
      should.exist(err);
      err.should.have.property('code', 400);
      callback();
    });
  });
});
