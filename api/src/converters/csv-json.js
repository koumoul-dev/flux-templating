var csv = require('csv');
var JSONStream = require('JSONStream');
var combine = require('stream-combiner');
var through2 = require('through2');

exports.id = 'csv-json';
exports.inputTypes = ['application/json', 'text/csv'];
exports.outputTypes = ['application/json', 'text/csv'];

exports.createStream = function(inputType) {
  var bufferer = through2(function(chunk, enc, callback) {
    callback(null, new Buffer(chunk));
  });
  if (inputType === 'text/csv') {
    return combine([csv.parse({
      columns: true
    }), JSONStream.stringify(), bufferer]);
  } else {
    return combine([JSONStream.parse('*'), csv.stringify(), bufferer]);
  }
};
