var should = require('should');
var qs = require('qs');

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

  it('should support passing types as shorter file extensions', function(callback) {
    api.documentOptions({
      body: JSON.stringify({
        who: 'World'
      }),
      qs: {
        template: 'hello_world.docx',
        'content-type': 'json',
        accept: 'docx'
      }
    }, function(err, result) {
      should.not.exist(err);
      result.should.match(/Hello/);
      result.should.match(/World/);
      callback();
    });
  });

  it('should support passing all parameters in a form-urlencoded body', function(callback) {
    api.documentOptions({
      body: qs.stringify({
        'content-type': 'json',
        accept: 'docx',
        template: 'hello_world.docx',
        body: {
          who: 'World'
        }
      }),
      headers: {
        'content-type': 'x-www-form-urlencoded'
      }
    }, function(err, result) {
      should.not.exist(err);
      result.should.match(/Hello/);
      result.should.match(/World/);
      callback();
    });
  });

  it('should support passing all parameters in a multipart-formdata body', function(callback) {
    api.documentOptions({
        formData: {
          'content-type': 'json',
          accept: 'docx',
          template: 'hello_world.docx',
          body: new Buffer(JSON.stringify({
            who: 'World'
          }))
        }
      },
      function(err, result) {
        should.not.exist(err);
        result.should.match(/Hello/);
        result.should.match(/World/);
        callback();
      });
  });

  it('should support filename parameter for octet-stream output', function(callback) {
    api.documentOptions({
      body: JSON.stringify({
        who: 'World'
      }),
      qs: {
        template: 'hello_world.docx',
        'content-type': 'json',
        accept: 'application/octet-stream',
        filename: 'hello.docx'
      }
    }, function(err, result, response) {
      should.not.exist(err);
      response.headers.should.have.property('content-type', 'application/octet-stream');
      response.headers.should.have.property('content-disposition', 'attachment; filename="hello.docx"');
      result.should.match(/Hello/);
      result.should.match(/World/);
      callback();
    });
  });

  it('should support passing fileName in a form-urlencoded body', function(callback) {
    api.documentOptions({
      body: qs.stringify({
        'content-type': 'json',
        accept: 'application/octet-stream',
        filename: 'hello.docx',
        template: 'hello_world.docx',
        body: {
          who: 'World'
        }
      }),
      headers: {
        'content-type': 'x-www-form-urlencoded'
      }
    }, function(err, result, response) {
      should.not.exist(err);
      response.headers.should.have.property('content-type', 'application/octet-stream');
      response.headers.should.have.property('content-disposition', 'attachment; filename="hello.docx"');
      result.should.match(/Hello/);
      result.should.match(/World/);
      callback();
    });
  });

  it('should support passing fileName in a multipart-formdata body', function(callback) {
    api.documentOptions({
        formData: {
          'content-type': 'json',
          accept: 'application/octet-stream',
          fileName: 'hello.docx',
          template: 'hello_world.docx',
          body: new Buffer(JSON.stringify({
            who: 'World'
          }))
        }
      },
      function(err, result, response) {
        should.not.exist(err);
        response.headers.should.have.property('content-type', 'application/octet-stream');
        response.headers.should.have.property('content-disposition', 'attachment; filename="hello.docx"');
        result.should.match(/Hello/);
        result.should.match(/World/);
        callback();
      });
  });

  it('should support use template file name as default', function(callback) {
    api.documentOptions({
      body: JSON.stringify({
        who: 'World'
      }),
      qs: {
        template: 'hello_world.docx',
        'content-type': 'json',
        accept: 'application/octet-stream'
      }
    }, function(err, result, response) {
      should.not.exist(err);
      response.headers.should.have.property('content-type', 'application/octet-stream');
      response.headers.should.have.property('content-disposition', 'attachment; filename="hello_world.docx"');
      result.should.match(/Hello/);
      result.should.match(/World/);
      callback();
    });
  });

});
