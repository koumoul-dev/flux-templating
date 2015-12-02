var csv = require('csv');
var JSONStream = require('JSONStream')
var es = require('event-stream');
var combine = require('stream-combiner');

exports.inputTypes = ['application/json', 'text/csv'];
exports.outputTypes = ['application/json', 'text/csv'];

exports.createStream = function(inputType) {
  var bufferToString = es.map(function(data, callback) {
    callback(null, data.toString());
  });
  if (inputType === 'text/csv') {
    return combine([bufferToString, csv.parse({
      columns: true
    }), JSONStream.stringify()]);
  } else {
    return combine([bufferToString, JSONStream.parse('*'), csv.stringify()]);
  }
};
