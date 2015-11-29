var converters = [require('./html-pdf')];

// Find the right converter to use given the mime types of desired inputs and outputs
exports.find = function(inputType, outputType) {
  return converters.filter(function(converter) {
    return converter.inputTypes.indexOf(inputType) !== -1 && converter.outputTypes.indexOf(outputType) !== -1;
  })[0];
};
