// Expose API functions for more concise integration tests
process.env.NODE_ENV = 'test';

var request = require('request');
var config = require('config');

exports.document = function(inputType, outputType, template, data, callback) {
  var isBuffer = data instanceof Buffer;

  if (typeof data === 'object' && !isBuffer) data = JSON.stringify(data);

  var options = {
    url: 'http://localhost:' + config.port + '/api/v1/document',
    body: data,
    headers: {
      'Content-Type': inputType,
      Accept: outputType
    },
    qs: {
      template: template
    }
  };

  if (isBuffer) {
    options.encoding = null;
  }

  request.post(options, function(err, response) {
    if (err) return callback(err);
    if (response.statusCode !== 200) {
      err = new Error(response.body);
      err.code = response.statusCode;
      return callback(err);
    }

    var result = response.body;
    if (isBuffer) {
      result = result.toString();
    }
    callback(null, result);
  });
};

exports.documentOptions = function(options, callback) {
  options.url = 'http://localhost:' + config.port + '/api/v1/document';
  request.post(options, function(err, response) {
    if (err) return callback(err);
    if (response.statusCode !== 200) {
      err = new Error(response.body);
      err.code = response.statusCode;
      return callback(err);
    }

    var result = response.body;
    callback(null, result, response);
  });
};
