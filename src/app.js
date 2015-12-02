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

var router = require('./router');
var app = express();
app.set('log', log);
app.use(cors());
app.use('/', router);

module.exports = app;
