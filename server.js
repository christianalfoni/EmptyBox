require('node-jsx').install({
  extension: '.jsx'
});

global.isProduction = process.env.NODE_ENV === 'production';

var express = require('express');
var start = require('./server/core/start.js');
var path = require('path');
var cerebralPublicPath = path.resolve(__dirname, 'cerebral_public');

var app = express();

app.use('/cerebral', function (req, res) {
  res.redirect('http://www.cerebraljs.com');
})

app.use('/todomvc', function (req, res) {
  res.redirect('http://www.cerebraljs.com/todomvc');
})

start(app);
