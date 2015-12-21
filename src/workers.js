var hostile = require('hostile');
var request = require('request');

var log = require('winston').loggers.get('flux-templating');

var workerTypes = ['unoconv', 'phantomjs'];
var workersHosts = {};
var workersRoundRobinCt = {};

exports.init = function(callback) {
  hostile.get(false, function(err, lines) {
    if (err) return callback(err);
    workerTypes.forEach(function(workerType) {
      var workerHostsMap = {};
      lines.forEach(function(line) {
        line.forEach(function(lineItem) {
          if (lineItem.match(new RegExp(workerType + '-worker'))) {
            workerHostsMap[line[0]] = 1;
          }
        });
      });
      workersHosts[workerType] = Object.keys(workerHostsMap);
      log.info(workerType + ' workers found: ', workersHosts[workerType]);
    });
    callback();
  });
};

exports.createStream = function(workerType, inputType, outputType) {
  workersRoundRobinCt[workerType] = workersRoundRobinCt[workerType] || 0;
  workersRoundRobinCt[workerType] = (workersRoundRobinCt[workerType] + 1) % workersHosts[workerType].length;

  var options = {
    url: 'http://' + workersHosts[workerType][workersRoundRobinCt[workerType]] + ':3121/document',
    headers: {
      'Content-Type': inputType,
      Accept: outputType
    },
    encoding: null
  };

  log.debug('Delegate conversion to worker using request', options);

  return request.post(options);
};
