// Finally pipe the transform stream to the HTTP response

var log = require('winston').loggers.get('flux-templating');

module.exports = pipeResponse;

function pipeResponse(req, res) {
  if (req.params.fileName) {
    res.set('Content-Disposition', 'attachment; filename="' + req.params.fileName + '"');
    res.set('Content-Type', 'application/octet-stream');
  } else {
    res.set('Content-Type', req.params.outputType);
  }

  req.params.transformStream.on('error', function(err) {
    log.error('Error in stream pipeline', err.stack);
    res.status(err.statusCode || 500);
    res.end(err.message);
  });

  return req.params.data.pipe(req.params.transformStream).pipe(res);
}
