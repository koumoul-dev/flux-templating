// Run/stop server as before/after of the whole test suite
// Useful only if you didn't already run a server manually

var config = require('config');
var expressApp = require('../app');

var server;
before(function runServer(callback) {
  server = expressApp.listen(config.port, callback);
});

after(function closeServer(callback) {
  server.close(callback);

});
