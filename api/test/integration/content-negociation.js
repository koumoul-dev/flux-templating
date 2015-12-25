var should = require('should');

var api = require('./api');

var docxMime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

describe('Content negociation', function() {
  it('should return a 501 error for unsupported input', function(callback) {
    api.document('application/pdf', 'application/pdf', null, '<html><body>This is a test</body></html>',
      function(err) {
        should.exist(err);
        err.should.have.property('code', 501);
        callback();
      });
  });

  it('should return a 501 error for unsupported output', function(callback) {
    api.document('application/html', 'application/json', null, '<html><body>This is a test</body></html>',
      function(err) {
        should.exist(err);
        err.should.have.property('code', 501);
        callback();
      });
  });

  it('should return a 400 error for unknown template file extension', function(callback) {
    api.document('application/html', 'application/json', 'template.invalidext', '',
      function(err) {
        should.exist(err);
        err.should.have.property('code', 400);
        callback();
      });
  });

  it('should return a 501 error for unsupported template', function(callback) {
    api.document('application/html', 'application/json', 'template.pdf', '',
      function(err) {
        should.exist(err);
        err.should.have.property('code', 501);
        callback();
      });
  });

  it('should return a 501 error for unsupported output conversion', function(callback) {
    api.document('application/json', 'application/json', 'hello_world.html', {},
      function(err) {
        should.exist(err);
        err.should.have.property('code', 501);
        callback();
      });
  });

  it('should return a 501 error for unsupported input conversion', function(callback) {
    api.document('application/html', 'application/html', 'hello_world.html', {},
      function(err) {
        should.exist(err);
        err.should.have.property('code', 501);
        callback();
      });
  });

  it('should return a 403 error for upgoing template path', function(callback) {
    api.document('application/html', 'application/json', '../test', '',
      function(err) {
        should.exist(err);
        err.should.have.property('code', 403);
        callback();
      });
  });

  it('should support passing headers as query params instead', function(callback) {
    api.documentOptions({
      body: JSON.stringify({
        who: 'World'
      }),
      qs: {
        template: 'hello_world.docx',
        'content-type': 'application/json',
        accept: docxMime
      }
    }, function(err, result) {
      should.not.exist(err);
      result.should.match(/Hello/);
      result.should.match(/World/);
      callback();
    });
  });
});
