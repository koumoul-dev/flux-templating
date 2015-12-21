var config = require('config');
var app = require('./src/app');
var log = app.log;

app.run(function(err) {
  if (err) log.error('Failed to run service', err.stack);
  else log.info('Service listening at http://localhost:%s', config.port);
});
