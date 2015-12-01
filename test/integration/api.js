// Expose API functions for more concise integration tests

var request = require('request');
var config = require('config');

exports.document = function(inputType, outputType, template, data, callback) {
  if (typeof data === 'object') data = JSON.stringify(data);

  request.post({
    url: 'http://localhost:' + config.port + '/document',
    body: data,
    headers: {
      'Content-Type': inputType,
      Accept: outputType
    },
    qs: {
      template: template
    }
  }, function(err, response) {
    if (err) return callback(err);
    if (response.statusCode !== 200) {
      err = new Error(response.body);
      err.code = response.statusCode;
      return callback(err);
    }
    callback(null, response.body);
  });
};