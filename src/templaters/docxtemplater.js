var Docxtemplater = require('docxtemplater');
//var es = require('event-stream');
var through2 = require('through2');
var expressions = require('angular-expressions');

var angularParser = function(tag) {
  var expr = expressions.compile(tag);
  return {
    get: expr
  };
};

var log = require('winston').loggers.get('flux-templating');

exports.id = 'docxtemplater';
exports.templateTypes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
exports.inputTypes = ['application/json'];
exports.outputTypes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

exports.createStream = function(templateBuffer) {
  var inputBuffers = [];

  // We consume the data stream entirely as
  // docx-templater doesn't have a stream mode
  /*return es.through(function write(data) {
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
      log.warn('Fail to compile or render dox template', e.stack);
      e.statusCode = 400;
      this.emit('error', e);
      return this.emit('end');
    }

    this.emit('data', result);
    this.emit('end');
  });*/

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
      log.warn('Fail to compile or render dox template', e.stack);
      e.statusCode = 400;
      return callback(e);
    }

    this.push(result);
    callback();
  });
};
