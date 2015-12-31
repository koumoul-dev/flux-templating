// Fetch template either from file system or HTTP request
// Also fetch data if it was passed as an url

var fs = require('fs');
var path = require('path');
//var request = require('request');
var config = require('config');
var mime = require('mime-types');
var templaters = require('../templaters');

var log = require('winston').loggers.get('flux-templating');

module.exports = fetch;

var upPathRegexp = /\.\./;

function fetch(req, res, next) {
  var msg;
  var templatePath = req.params.templatePath;

  if (!templatePath) {
    return next();
  }

  if (templatePath.match(upPathRegexp)) {
    msg = 'The template path ' + templatePath + ' tries to go up in the directories. This is forbidden.';
    log.warn(msg);
    return res.status(403).send(msg);
  }

  var templateType = mime.lookup(templatePath);
  if (!templateType) {
    msg = 'lookup of mime-type failed for template path ' + templatePath + '. Please use a known file extension.';
    log.debug(msg);
    return res.status(400).send(msg);
  }
  log.debug('Template mime-type is %s based on template path %s', templateType, templatePath);

  req.params.templater = templaters.find(templateType);
  if (!req.params.templater) {
    msg = 'Template type ' + templateType + ' not matched by supported templaters';
    log.debug(msg);
    return res.status(501).send(msg);
  }
  log.debug('Templater %s selected base on template mime-type %s', req.params.templater.id, templateType);

  var actualPath = path.resolve(__dirname, '..', config.templatesPath, templatePath);
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

    req.params.templateBuffer = templateBuffer;
    next();
  });
}
