// Conversions and templating are orchestrated in this router
// It sets a req.params.transformStream which should be applied to the input data

var converters = require('../converters');
var combiner = require('../combiner');

var log = require('winston').loggers.get('flux-templating');

module.exports = transform;

function transform(req, res, next) {
  var msg;
  var inputType = req.params.inputType;
  var outputType = req.params.outputType;

  // No template = pure conversion mode.
  if (!req.params.templatePath) {
    var converter = converters.find(inputType, outputType);
    if (!converter) {
      msg = 'No converter found from ' + inputType + ' to ' + outputType;
      log.debug(msg);
      return res.send(501, msg);
    }
    log.debug('Simple conversion from ' + inputType + ' to ' + outputType + ' use converter ' + converter.id);
    req.params.transformStream = converter.createStream(inputType, outputType);
    return next();
  }

  req.params.transformStream = combiner.combine(inputType, outputType, req.params.templater, req.params.templateBuffer);

  if (!req.params.transformStream) {
    msg = 'Failed to find a conversion path from ' + inputType + ' to ' + outputType;
    msg += ' from templater ' + req.params.templater.id;
    log.error(msg);
    return res.status(501).send(msg);
  }

  next();
}
