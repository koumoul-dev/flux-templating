var XlsxTemplate = require('xlsx-template');
var through2 = require('through2');
var isArray = require('lodash.isarray');

var log = require('winston').loggers.get('flux-templating');

exports.id = 'xlsx-template';
exports.templateTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
exports.inputTypes = ['application/json'];
exports.outputTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

exports.createStream = function(templateBuffer) {
  var inputBuffers = [];

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
      template = new XlsxTemplate(templateBuffer);
      if (isArray(input)) {
        for (var i = 0; i < input.length; i++) {
          template.substitute(i + 1, input[i]);
        }
      } else {
        template.substitute(1, input);
      }

      result = template.generate();
    } catch (e) {
      log.warn('Fail to compile or render xlsx template', e.stack);
      e.statusCode = 400;
      return callback(e);
    }

    this.push(result);
    callback();
  });
};
