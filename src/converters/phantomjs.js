var workers = require('../workers');

exports.id = 'phantomjs';

exports.inputTypes = ['text/html'];

exports.outputTypes = [
  'application/pdf',
  'image/png',
  'image/gif',
  'image/jpeg'
];

exports.createStream = function(inputType, outputType) {
  return workers.createStream('phantomjs', inputType, outputType);
};
