var spawn = require('child_process').spawn;
var fs = require('fs');
var es = require('event-stream');
var mime = require('mime-types');
var through2 = require('through2');
var uuid = require('node-uuid');

var log = require('winston').loggers.get('flux-templating');

// A list of possible input and output types can be found here:
// http://wiki.services.openoffice.org/wiki/Framework/Article/Filter/FilterList_OOo_3_0
// We do not list all of them. Please feel free to submit an issue if a useful one is missing.
// matching done manually with mime type: https://github.com/jshttp/mime-db/blob/master/db.json
exports.inputTypes = [
  'text/plain',
  'text/html',
  // Microsoft office
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
  // Microsoft office (older)
  'application/vnd.ms-excel', // xls and others
  'application/msword', // doc, dot
  'application/vnd.ms-powerpoint', // ppt, pps, pot
  // Open document (open office and libre office)
  'application/vnd.oasis.opendocument.chart', // odc
  'application/vnd.oasis.opendocument.presentation', // odp
  'application/vnd.oasis.opendocument.spreadsheet', // ods
  'application/vnd.oasis.opendocument.text', // odt
  'application/vnd.oasis.opendocument.formula', // odf
  // Star office
  'application/vnd.stardivision.calc', // sdc
  'application/vnd.stardivision.draw', // sda
  'application/vnd.stardivision.impress', // sdd
  'application/vnd.stardivision.write', // sdw, vor
];

exports.outputTypes = [
  'application/pdf',
  'text/html',
  'image/png',
  'image/svg+xml'
];


var listener;

function prepareListener() {
  log.debug('Unoconv listener will be spawned');
  listener = spawn('unoconv', ['--listener']);
  listener.on('exit', function(code) {
    log.warn('Unoconv listener exited (it should act as a daemon) with code ' + code);
    prepareListener();
  });
}
prepareListener();


var emptyDocRegxp = /Document is empty/;

exports.createStream = function(inputType, outputType) {
  var inputExtension = mime.extension(inputType);
  var outputExtension = mime.extension(outputType);

  var tempPath = '/tmp/' + uuid.v1() + '.' + inputExtension;
  var writeStream = fs.createWriteStream(tempPath);
  log.debug('Unoconv converter create temp file ' + tempPath);

  // A simple passthrough stream to be returned now but piped only later on
  var readStream = through2();
  var duplex = es.duplex(writeStream, readStream);

  writeStream.on('error', function(err) {
    log.error('Unoconv converter failed to write temp file', err.stack);
    duplex.emit('error', err);
  });

  writeStream.on('finish', function() {
    var child = spawn('unoconv', ['--stdout', '--no-launch', '--format', outputExtension, tempPath]);
    child.stdout.pipe(readStream);
    child.stdout.on('end', function() {
      log.debug('Unoconv converter delete temp file ' + tempPath);
      fs.unlink(tempPath, function(err) {
        if (err) log.error('Unoconv converter failed to remove temp file', err.stack);
      });
    });
    child.stderr.on('data', function(data) {
      var dataStr = data.toString();
      // An error is often reported by unoconv about empty document
      if (!dataStr.match(emptyDocRegxp)) {
        duplex.emit('error', new Error(dataStr));
      }
    });
  });

  return duplex;
};

// This version is kept in comments because it is better conceptually
// as it uses stdin to send data to unoconv instead of a temp file.
// unfortunately reading from stdin seems to be a broken feature of unoconv
// TODO: try it again some day ? Create an issue on the unoconv project ?
/*exports.createStream = function(inputType, outputType) {
  var bufferToAscii = through2({
    encoding: 'ascii'
  });
  var outputExtension = mime.extension(outputType);
  var child = spawn('unoconv', ['--stdin', '--stdout', '-f', outputExtension]);
  var duplex = es.child(child);
  child.stderr.on('data', function(data) {
    var dataStr = data.toString();
    // An error is often reported by unoconv about empty document
    if (!dataStr.match(emptyDocRegxp)) {
      duplex.emit('error', new Error(dataStr));
    }
  });
  return combine([bufferToAscii, duplex]);
};*/
