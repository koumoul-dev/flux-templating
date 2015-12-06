var should = require('should');

var api = require('./api');

var docxMime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

describe('Docx templater', function() {
  it('should apply a docx template to JSON data', function(callback) {
    api.document('application/json', docxMime, 'hello_world.docx', {
      who: 'World'
    }, function(err, result) {
      should.not.exist(err);
      result.should.match(/Hello/);
      result.should.match(/World/);
      callback();
    });
  });

  it('should get a 404 for missing template', function(callback) {
    api.document('application/json', docxMime, 'this_does_not_exist.docx', {
      who: 'World'
    }, function(err) {
      should.exist(err);
      err.should.have.property('code', 404);
      callback();
    });
  });

  it('should get a 400 for bad JSON input', function(callback) {
    api.document('application/json', docxMime, 'hello_world.docx', 'this is not JSON', function(err) {
      should.exist(err);
      err.should.have.property('code', 400);
      callback();
    });
  });

  it('should get a 400 for bad docx template', function(callback) {
    api.document('application/json', docxMime, 'hello_world_bad.docx', {
      who: 'World'
    }, function(err) {
      should.exist(err);
      err.should.have.property('code', 400);
      callback();
    });
  });
});
