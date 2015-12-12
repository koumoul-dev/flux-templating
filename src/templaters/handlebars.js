var handlebars = require('handlebars');
require('handlebars-helpers');
var es = require('event-stream');

var log = require('winston').loggers.get('flux-templating');

exports.templateTypes = ['text/x-handlebars-template', 'text/plain', 'text/html'];
exports.inputTypes = ['application/json'];
exports.outputTypes = ['text/plain', 'text/html'];

exports.createStream = function(templateBuffer) {
  var inputBuffers = [];

  // We consume the data stream entirely as
  // handlebars doesn't have a stream mode
  return es.through(function write(data) {
    inputBuffers.push(data);
  }, function end() {
    var input;
    try {
      input = JSON.parse(Buffer.concat(inputBuffers).toString());
    } catch (e) {
      log.warn('Fail to parse input data', e.stack);
      e.statusCode = 400;
      this.emit('error', e);
      return this.emit('end');
    }

    var template;
    var result;
    try {
      template = handlebars.compile(templateBuffer.toString());
      result = template(input);
    } catch (e) {
      log.warn('Fail to compile or render handlebars template', e.stack);
      e.statusCode = 400;
      this.emit('error', e);
      return this.emit('end');
    }

    this.emit('data', new Buffer(result));
    this.emit('end');
  });
};
