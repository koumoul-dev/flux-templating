var Docxtemplater = require('docxtemplater');
var es = require('event-stream');
var expressions = require('angular-expressions');

var angularParser = function(tag) {
  var expr = expressions.compile(tag);
  return {
    get: expr
  };
};

var log = require('winston').loggers.get('flux-templating');

exports.templateTypes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
exports.inputTypes = ['application/json'];
exports.outputTypes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

exports.createStream = function(templateBuffer) {
  var input = '';

  // We consume the data stream entirely as
  // handlebars doesn't have a stream mode
  return es.through(function write(data) {
    input += data.toString();
  }, function end() {

    try {
      input = JSON.parse(input);
    } catch (e) {
      log.warn('Fail to parse input data', e.stack);
      e.statusCode = 400;
      this.emit('error', e);
      return this.emit('end');
    }

    var template;
    var result;
    try {
      template = new Docxtemplater(templateBuffer.toString('binary'));
      template.setOptions({
        parser: angularParser
      });
      template.setData(input);
      template.render();
      result = template.getZip().generate({
        type: 'nodebuffer'
      });
    } catch (e) {
      log.warn('Fail to compile or render handlebars template', e.stack);
      e.statusCode = 400;
      this.emit('error', e);
      return this.emit('end');
    }

    this.emit('data', result);
    this.emit('end');
  });
};
