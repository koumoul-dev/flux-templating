var handlebars = require('handlebars');
require('handlebars-helpers');
var through2 = require('through2');

var log = require('winston').loggers.get('flux-templating');

exports.id = 'handlebars';
exports.templateTypes = ['text/x-handlebars-template', 'text/plain', 'text/html'];
exports.inputTypes = ['application/json'];
exports.outputTypes = ['text/plain', 'text/html'];

exports.createStream = function(templateBuffer) {
  var inputBuffers = [];

  // We consume the data stream entirely as
  // handlebars doesn't have a stream mode
  return through2(function transform(chunk, enc, callback) {
    inputBuffers.push(chunk);
    callback();
  }, function flush(callback) {
    var input;
    try {
      input = JSON.parse(Buffer.concat(inputBuffers).toString());
    } catch (e) {
      log.warn('Fail to parse input data', e.stack);
      e.statusCode = 400;
      return callback(e);
    }

    var template;
    var result;
    try {
      template = handlebars.compile(templateBuffer.toString());
      result = template(input);
    } catch (e) {
      log.warn('Fail to compile or render handlebars template', e.stack);
      e.statusCode = 400;
      return callback(e);
    }

    this.push(new Buffer(result));
    callback();
  });
};
