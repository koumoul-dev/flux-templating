// Extract parameters from a query for the router using tolerant content negociation
// Use headers, query parameters, url-formencoded and multipart-formdata

var mime = require('mime-types');
var qs = require('qs');
var Readable = require('stream').Readable;
var Busboy = require('busboy');
var path = require('path');

exports.get = getParameters;

function fromFormURLEncoded(req, callback) {
  var inputBuffers = [];
  var params = {};
  req.on('data', function(chunk) {
    inputBuffers.push(chunk);
  });
  req.on('end', function() {
    var formParams = qs.parse(Buffer.concat(inputBuffers).toString());
    Object.keys(formParams).forEach(function(formParamKey) {
      if (formParamKey.toLowerCase() === 'content-type' || formParamKey.toLowerCase() === 'c') {
        params.inputType = formParams[formParamKey];
      }
      if (formParamKey.toLowerCase() === 'accept' || formParamKey.toLowerCase() === 'a') {
        params.outputType = formParams[formParamKey];
      }
      if (formParamKey.toLowerCase() === 'template' || formParamKey.toLowerCase() === 't') {
        params.templatePath = formParams[formParamKey];
      }
      if (formParamKey.toLowerCase() === 'filename' || formParamKey.toLowerCase() === 'f') {
        params.fileName = formParams[formParamKey];
      }
    });

    // see http://stackoverflow.com/questions/12755997/how-to-create-streams-from-string-in-node-js
    params.data = new Readable();
    params.data.push(new Buffer(JSON.stringify(formParams.body)));
    params.data.push(null);

    callback(params);
  });
}

function fromMultipartFormData(req, callback) {
  var params = {};
  var busboy = new Busboy({
    headers: req.headers
  });
  // Fields should be placed before file for better streaming of main content
  // the defualt behavior of browsers ?
  busboy.on('field', function(fieldname, val) {
    if (fieldname.toLowerCase() === 'content-type' || fieldname.toLowerCase() === 'c') {
      params.inputType = val;
    }
    if (fieldname.toLowerCase() === 'accept' || fieldname.toLowerCase() === 'a') {
      params.outputType = val;
    }
    if (fieldname.toLowerCase() === 'template' || fieldname.toLowerCase() === 't') {
      params.templatePath = val;
    }
    if (fieldname.toLowerCase() === 'filename' || fieldname.toLowerCase() === 'f') {
      params.fileName = val;
    }
  });
  busboy.on('file', function(fieldname, file) {
    params.data = file;
    callback(params);
  });
  req.pipe(busboy);
}

function fromQueryAndHeaders(req, params) {

  // Content negociation can be done either through standard headers or custom
  // query parameter. This is to allow using the API using a simple HTML link
  Object.keys(req.query).forEach(function(queryParamKey) {
    if (queryParamKey.toLowerCase() === 'content-type' || queryParamKey.toLowerCase() === 'c') {
      params.inputType = params.inputType || req.query[queryParamKey];
    }
    if (queryParamKey.toLowerCase() === 'accept' || queryParamKey.toLowerCase() === 'a') {
      params.outputType = params.outputType || req.query[queryParamKey];
    }
    if (queryParamKey.toLowerCase() === 'template' || queryParamKey.toLowerCase() === 't') {
      params.templatePath = params.templatePath || req.query[queryParamKey];
    }
    if (queryParamKey.toLowerCase() === 'filename' || queryParamKey.toLowerCase() === 'f') {
      params.fileName = params.fileName || req.query[queryParamKey];
    }
  });
  params.inputType = params.inputType || (req.get('content-type') && req.get('content-type').split(';')[0]);
  params.outputType = params.outputType || (req.get('accept') && req.get('accept').split(';')[0]);

  // For easier usage support passing types using shorter file extensions
  params.inputType = mime.lookup(params.inputType) || params.inputType;
  params.outputType = mime.lookup(params.outputType) || params.outputType;

  // Special case for octet-stream output. Conversion output is determined from requested file name
  if (params.outputType === 'application/octet-stream') {
    params.fileName = params.fileName || (params.templatePath && path.basename(params.templatePath));
    params.outputType = mime.lookup(params.fileName);
  }

  return params;
}

function getParameters(req, callback) {
  var contentType = req.get('content-type') && req.get('content-type').split(';')[0];
  if (contentType === 'x-www-form-urlencoded') {
    fromFormURLEncoded(req, function(params) {
      callback(fromQueryAndHeaders(req, params));
    });
  } else if (contentType === 'multipart/form-data') {
    fromMultipartFormData(req, function(params) {
      callback(fromQueryAndHeaders(req, params));
    });
  } else {
    callback(fromQueryAndHeaders(req, {
      data: req
    }));
  }
}
