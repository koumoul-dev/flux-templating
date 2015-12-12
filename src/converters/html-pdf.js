var pdf = require('html-pdf');
var es = require('event-stream');

exports.inputTypes = ['text/html'];
exports.outputTypes = ['application/pdf'];

exports.createStream = function() {
  var inputBuffers = [];

  // We consume the data stream entirely as
  // html-pdf doesn't have a input stream mode
  return es.through(function write(data) {
    inputBuffers.push(data);
  }, function end() {
    var _this = this;
    var input = Buffer.concat(inputBuffers).toString();
    pdf.create(input).toStream(function(err, pdfStream) {
      if (err) _this.emit('error', err);

      pdfStream.on('error', function(err) {
        _this.emit('error', err);
      });
      pdfStream.on('data', function(data) {
        _this.emit('data', data);
      });
      pdfStream.on('end', function() {
        _this.emit('end');
      });
    });
  });
};
