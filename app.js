// Main entry point of the fulx-templating service
// Exports an express application and start this application
// in a HTTP server if run as a main node.js script

var express = require('express');
var cors = require('cors');
var winston = require('winston');

// Fetch configuration managed by node-config
var config = require('config');

// Configure logger winston logger
require('winston-configure')(config.log);
var log = winston.loggers.get('flux-templating');
log.debug('Initialize service');

var router = require('./src/router');
var app = express();
app.use(cors());
app.use('/', router);

// Either run the application or export it
if (require.main === module) {
  app.listen(config.port, function(err) {
    if (err) log.error('Failed to run service', err.stack);
    else log.info('Service listening at http://localhost:%s', config.port);
  });
} else {
  module.exports = app;
}
