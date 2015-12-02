var should = require('should');

var api = require('./api');

describe('CSV-JSON converter', function() {
  it('should apply a CSV to JSON conversion', function(callback) {
    api.document('text/csv', 'application/json', null, 'col1,col2\nval1,val2',
      function(err, body) {
        should.not.exist(err);
        body.should.equal('[\n{"col1":"val1","col2":"val2"}\n]\n');
        callback();
      });
  });

  it('should apply a CSV to JSON conversion as input to a HTML template', function(callback) {
    api.document('text/csv', 'text/html', 'hello_worlds.html', 'Who\nWorld\nUniverse',
      function(err, body) {
        should.not.exist(err);
        body.should.match(/Hello World/);
        body.should.match(/Hello Univers/);
        callback();
      });
  });

  it('should apply a JSON to CSV conversion', function(callback) {
    api.document('application/json', 'text/csv', null, '[[1,2,3], [4,5,6]]',
      function(err, body) {
        should.not.exist(err);
        body.should.equal('1,2,3\n4,5,6\n');
        callback();
      });
  });

  it('should return a 500 error for JSON parse failure', function(callback) {
    // Actually it would be better to get a 400
    // But it is not easy to differentiate errors in streaming
    api.document('application/json', 'text/csv', null, '1:est,2,3',
      function(err) {
        should.exist(err);
        callback();
      });
  });

  it('should return a truncated body for JSON parse failure after first item', function(callback) {
    // Actually it would be better to get a 400
    // But it is not possible to change the status code after has started to stream
    api.document('application/json', 'text/csv', null, '[[1,2,3],test',
      function(err, body) {
        should.not.exist(err);
        body.should.startWith('1,2,3\nInvalid');
        callback();
      });
  });

});
