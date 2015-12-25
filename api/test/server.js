// Run/stop server as before/after of the whole test suite
// Useful only if you didn't already run a server manually
process.env.NODE_ENV = 'test';

var app = require('../../app');

before(function runServer(callback) {
  app.run(callback);
});

after(function closeServer(callback) {
  app.shutdown(callback);
});
