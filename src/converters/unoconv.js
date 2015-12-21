var workers = require('../workers');

exports.id = 'unoconv';

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

exports.createStream = function(inputType, outputType) {
  return workers.createStream('unoconv', inputType, outputType);
};
