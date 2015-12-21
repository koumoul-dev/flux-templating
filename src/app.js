// Main entry point of the fulx-templating service
// Exports an express application and start this application
// in a HTTP server if run as a main node.js script

var express = require('express');
var cors = require('cors');
var winston = require('winston');

// Fetch configuration managed by node-config
var config = require('config');

// Configure logger winston logger
// WARN: do this before it is used anywhere
require('winston-configure')(config.log);

var log = winston.loggers.get('flux-templating');
log.debug('Initialize service');

var workers = require('./workers');
var router = require('./router');
var app = express();
app.set('log', log);
app.use(cors());

app.use('/', router);

var server;
exports.run = function(callback) {
  workers.init(function(err) {
    if (err) return callback(err);
    server = app.listen(config.port, callback);
  });
};

exports.shutdown = function(callback) {
  server.close(callback);
};

exports.log = log;
