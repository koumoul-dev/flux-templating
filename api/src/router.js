var express = require('express');
var parameters = require('./middlewares/parameters');
var template = require('./middlewares/template');
var transform = require('./middlewares/transform');
var pipeResponse = require('./middlewares/pipe-response');

var router = express.Router();
router.get('/document', parameters, template, transform, pipeResponse);
router.post('/document', parameters, template, transform, pipeResponse);

module.exports = router;
