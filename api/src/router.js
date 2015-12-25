var path = require('path');
var fs = require('fs');
var config = require('config');
var express = require('express');
var mime = require('mime-types');
var templaters = require('./templaters');
var converters = require('./converters');
var combiner = require('./combiner');

var log = require('winston').loggers.get('flux-templating');

var upPathRegexp = /\.\./;

function pipeToReqRes(req, transform, res) {
  transform.on('error', function(err) {
    log.error('Error in stream pipeline', err.stack);
    res.status(err.statusCode || 500);
    res.end(err.message);
  });

  return req.pipe(transform).pipe(res);
}

// Everything is orchestrated in this route !
// find the right templaters and converters based on mime types
// then apply the resulting transform stream to the request and
// pipe to the response
function mainRoute(req, res) {
  var msg;

  var templatePath = req.query.template || req.query.t;

  // Content negociation can be done either through standard headers or custom
  // query parameter. This is to allow using the API using a simple HTML link
  var inputType, outputType;
  Object.keys(req.query).forEach(function(queryParamKey) {
    if (queryParamKey.toLowerCase() === 'content-type' || queryParamKey.toLowerCase() === 'c') {
      inputType = req.query[queryParamKey];
    }
    if (queryParamKey.toLowerCase() === 'accept' || queryParamKey.toLowerCase() === 'a') {
      outputType = req.query[queryParamKey];
    }
  });
  inputType = inputType || req.get('content-type').split(';')[0];
  outputType = outputType || req.get('accept').split(';')[0];

  // For easier usage support passing types using shorter file extensions
  inputType = mime.lookup(inputType) || inputType;
  outputType = mime.lookup(outputType) || outputType;

  // No template = pure conversion mode.
  if (!templatePath) {
    var converter = converters.find(inputType, outputType);
    if (!converter) {
      msg = 'No converter found from ' + inputType + ' to ' + outputType;
      log.debug(msg);
      return res.send(501, msg);
    }
    log.debug('Simple conversion from ' + inputType + ' to ' + outputType + ' use converter ' + converter.id);
    var converterStream = converter.createStream(inputType, outputType);

    return pipeToReqRes(req, converterStream, res);
  }

  if (templatePath.match(upPathRegexp)) {
    msg = 'The template path ' + templatePath + ' tries to go up in the directories. This is forbidden.';
    log.warn(msg);
    return res.status(403).send(msg);
  }

  var templateType = mime.lookup(templatePath);
  if (!templateType) {
    msg = 'lookup of mime-type failed for template path ' + templatePath + '. Please use a meaningful file extension.';
    log.debug(msg);
    return res.status(400).send(msg);
  }
  log.debug('Template mime-type is %s based on template path %s', templateType, templatePath);

  var templater = templaters.find(templateType);
  if (!templater) {
    msg = 'Template type ' + templateType + ' not matched by supported templaters';
    log.debug(msg);
    return res.status(501).send(msg);
  }
  log.debug('Templater %s selected base on template mime-type %s', templater.id, templateType);

  var actualPath = path.resolve(__dirname, config.templatesPath, templatePath);
  fs.readFile(actualPath, function(err, templateBuffer) {
    if (err && err.code === 'ENOENT') {
      msg = 'template not found from path ' + templatePath;
      log.debug(msg, err.stack);
      return res.status(404).send(msg);
    }
    if (err) {
      msg = 'fail to read template from path ' + templatePath;
      log.error(msg, err.stack);
      return res.status(500).send(msg + ' ' + err.message);
    }

    var combinedStream = combiner.combine(inputType, outputType, templater, templateBuffer);

    if (!combinedStream) {
      msg = 'Failed to find a conversion path from ' + inputType + ' to ' + outputType;
      msg += ' from template type ' + templateType;
      log.error(msg);
      return res.status(501).send(msg);
    }

    pipeToReqRes(req, combinedStream, res);
  });
}

var router = express.Router();
router.get('/document', mainRoute);
router.post('/document', mainRoute);

module.exports = router;
