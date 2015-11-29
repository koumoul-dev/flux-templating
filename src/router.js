var path = require('path');
var fs = require('fs');
var express = require('express');
var mime = require('mime-types');
var templaters = require('./templaters');
var converters = require('./converters');
var combiner = require('./combiner');

var log = require('winston').loggers.get('flux-templating');

var upPathRegexp = /\.\./;

// Everything is orchestrated in this route !
// find the right templaters and converters based on mime types
// then apply the resulting transform stream to the request and
// pipe to the response
function mainRoute(req, res) {
  var msg;

  var templatePath = req.query.template || req.query.t;
  var inputType = req.get('content-type').split(';')[0];
  var outputType = req.get('accept').split(';')[0];

  // No template = pure conversion mode.
  if (!templatePath) {
    var converter = converters.find(inputType, outputType);
    if (!converter) {
      msg = 'No converter found from ' + inputType + ' to ' + outputType;
      log.debug(msg);
      return res.send(501, msg);
    }
    var converterStream = converter.createStream(inputType, outputType);

    converterStream.on('error', function(err) {
      res.status(err.statusCode || 500).send(err.message);
    });

    return req.pipe(converterStream).pipe(res);
  }

  if (templatePath.match(upPathRegexp)) {
    msg = 'The template path ' + templatePath + ' tries to go up in the directories. This is forbidden.';
    log.warn(msg);
    return res.send(400, msg);
  }

  var templateType = mime.lookup(templatePath);
  if (!templateType) {
    msg = 'lookup of mime-type failed for template path ' + templatePath + '. Please use a meaningful file extension.';
    log.debug(msg);
    return res.status(501).send(msg);
  }

  var templater = templaters.find(templateType);
  if (!templater) {
    msg = 'Template type ' + templateType + ' not matched by supported templaters';
    log.debug(msg);
    return res.status(501).send(msg);
  }

  var actualPath = path.resolve(__dirname, '../templates/', templatePath);
  fs.readFile(actualPath, function(err, templateBuffer) {
    if (err && err.code === 'ENOENT') {
      msg = 'template not found from path ' + templatePath;
      log.debug(msg, err.stack);
      return res.status(404).send(msg);
    }
    if (err) {
      msg = 'fail to read template from path ' + templatePath;
      log.error(msg, err.stack);
      res.status(500).send(msg + ' ' + err.message);
    }

    var combinedStream = combiner.combine(inputType, outputType, templater, templateBuffer);

    if (!combinedStream) {
      msg = 'Failed to find a conversion path from ' + inputType + ' to ' + outputType + ' from template type ' + templateType;
      log.error(msg, err.stack);
      res.status(401).send(msg + ' ' + err.message);
    }

    combinedStream.on('error', function(err) {
      res.status(err.statusCode || 500).send(err.message);
    });

    req.pipe(combinedStream).pipe(res);
  });
}

var router = express.Router();
router.get('/document', mainRoute);
router.post('/document', mainRoute);

module.exports = router;
