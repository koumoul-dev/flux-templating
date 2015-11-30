var request = require('request');
var config = require('config');
var expressApp = require('../../app');

var server;
before(function runServer(callback) {
  server = expressApp.listen(config.port, callback);
  server.on('error', function(err) {
    // Support using an already running service (useful to test dist)
    if (err.code !== 'EADDRINUSE') throw err;
    callback();
  });
});

after(function closeServer(callback) {
  try {
    server.close(callback);
  } catch(err) {
    // Ignore error. Not meaningful.
    callback();
  }
});

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
