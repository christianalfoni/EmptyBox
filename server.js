require('node-jsx').install({
  extension: '.jsx'
});

global.isProduction = process.env.NODE_ENV === 'production';

var express = require('express');
var start = require('./server/core/start.js');

var app = express();

// Add more routes here

start(app);


