var templaters = [
  require('./handlebars'),
  require('./docxtemplater')
];

// Find the right templater to use given the mime-type of a template file
exports.find = function(templateType) {
  return templaters.filter(function(templater) {
    return templater.templateTypes.indexOf(templateType) !== -1;
  })[0];
};
