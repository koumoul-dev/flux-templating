var fs = require('fs');
var apiBenchmark = require('api-benchmark');

var services = {
  server1: 'http://localhost:3111'
};

var routes = {
  handlebarsToText: {
    method: 'get',
    route: 'api/v1/document',
    expectedStatusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/plain'
    },
    data: {
      who: 'World'
    },
    query: {
      template: 'hello_world.txt'
    }
  },
  handlebarsToPDF: {
    method: 'get',
    route: 'api/v1/document',
    expectedStatusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/pdf'
    },
    data: {
      who: 'World'
    },
    query: {
      template: 'hello_world.html'
    }
  },
  docxToPDF: {
    method: 'get',
    route: 'api/v1/document',
    expectedStatusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/pdf'
    },
    data: {
      who: 'World'
    },
    query: {
      template: 'hello_world.docx'
    }
  }
};

apiBenchmark.measure(services, routes, {
  runMode: 'parallel',
  maxConcurrentRequests: 20
}, function(err, results) {
  if (err) throw err;
  apiBenchmark.getHtml(results, function(err, html) {
    if (err) throw err;
    console.log('Write results in benchmark-results/report.html');
    fs.writeFileSync('./benchmark-results/report.html', html);
  });
});
