var should = require('should');

var app = require('./app');

describe('PDF converter', function(){
  it('should apply a PDF conversion to a HTML input', function(callback) {
    app.document('text/html', 'application/pdf', null, '<html><body>This is a test</body></html>', function(err) {
      should.not.exist(err);
      // A way to check the content ?
      callback();
    });
  });

  it('should apply a PDF conversion to the result of a handlebars template', function(callback) {
    app.document('application/json', 'application/pdf', 'hello_world.html', {
      who: 'World'
    }, function(err) {
      should.not.exist(err);
      // A way to check the content ?
      callback();
    });
  });
});
