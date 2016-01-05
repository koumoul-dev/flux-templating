var should = require('should');

var api = require('./api');

var xlsxMime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

describe('Xlsx templater', function() {
  it('should apply a xlsx template to JSON data', function(callback) {
    api.document('application/json', xlsxMime, 'hello_world.xlsx', {
      who: 'World'
    }, function(err, result) {
      should.not.exist(err);
      result.should.match(/World/);
      callback();
    });
  });

  it('should apply a xlsx template with multiple sheets to JSON array', function(callback) {
    api.document('application/json', xlsxMime, 'hello_world.xlsx', [{
      who: 'World'
    }, {
      also: 'You'
    }], function(err, result) {
      should.not.exist(err);
      result.should.match(/World/);
      result.should.match(/You/);
      callback();
    });
  });
});
