// Select converters and templaters streams based on mime types
// then combine them into a single transform stream

var combine = require('stream-combiner');

var converters = require('./converters');

exports.combine = function(inputType, outputType, templater, templateBuffer) {
  var i, inputConverter, outputConverter, templaterInputType, templaterOutputType;

  // The templater does not accept the requested input type
  // try finding a suitable converter
  if (templater.inputTypes.indexOf(inputType) === -1) {
    for (i = 0; i < templater.inputTypes.length; i++) {
      templaterInputType = templater.inputTypes[i];
      inputConverter = converters.find(inputType, templaterInputType);
      if (inputConverter) break;
    }

    if (!inputConverter) return null;
  }

  // The templater does not accept the requested output type
  // try finding a suitable converter
  if (templater.outputTypes.indexOf(outputType) === -1) {
    for (i = 0; i < templater.outputTypes.length; i++) {
      templaterOutputType = templater.outputTypes[i];
      outputConverter = converters.find(templaterOutputType, outputType);
      if (outputConverter) break;
    }

    if (!outputConverter) return null;
  }

  var combinedStreams = [];
  if (inputConverter) {
    combinedStreams.push(inputConverter.createStream(inputType, templaterInputType));
  }
  combinedStreams.push(
    templater.createStream(templateBuffer, templaterInputType || inputType, templaterOutputType || outputType)
  );
  if (outputConverter) {
    combinedStreams.push(outputConverter.createStream(templaterOutputType, outputType));
  }

  return combine(combinedStreams);
};
