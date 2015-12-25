var fs = require('fs');
var should = require('should');

var api = require('./api');

var docxMime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

describe('UNO converter', function() {

  // A small delay to ensure that unoconv listener is started
  before(function(done) {
    this.timeout(1000);
    setTimeout(done, 500);
  });

  it('should get a PDF from a docx file', function(callback) {
    api.document(docxMime, 'application/pdf', null, fs.readFileSync(__dirname + '/../../../resources/hello_world.docx'),
      function(err) {
        should.not.exist(err);
        // TODO: a way to check the content
        callback();
      });
  });

  it('should get a HTML from a docx file', function(callback) {
    api.document(docxMime, 'text/html', null, fs.readFileSync(__dirname + '/../../../resources/hello_world.docx'),
      function(err, result) {
        should.not.exist(err);
        result.should.match(/Hello/);
        result.should.match(/who/);
        callback();
      });
  });

  it('should convert to HTML the result of a docx template', function(callback) {
    api.document('application/json', 'text/html', 'hello_world.docx', {
      who: 'World'
    }, function(err, result) {
      should.not.exist(err);
      result.should.match(/Hello/);
      result.should.match(/World/);
      callback();
    });
  });

  it('should get a HTML from TXT file', function(callback) {
    api.document('text/plain', 'text/html', null, 'Hello',
      function(err, result) {
        should.not.exist(err);
        result.should.match(/Hello/);
        callback();
      });
  });
});
