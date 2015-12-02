var config = require('config');
var app = require('./src/app');
var log = app.get('log');

app.listen(config.port, function(err) {
  if (err) log.error('Failed to run service', err.stack);
  else log.info('Service listening at http://localhost:%s', config.port);
});
