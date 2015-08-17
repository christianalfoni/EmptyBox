var Webpack = require('webpack');
var path = require('path');
var appPath = path.resolve(__dirname, 'cerebral');
var nodeModulesPath = path.resolve(__dirname, 'node_modules');
var buildPath = path.resolve(__dirname, 'cerebral_public');

var config = {
  entry: path.resolve(appPath, 'main.js'),
  output: {
    path: buildPath,
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      exclude: [nodeModulesPath]
    }, {
      test: /\.css$/,
      loader: 'style!css'
    }, {
      test: /\.md$/,
      loader: 'raw'
    }, {
      test: /\.json$/,
      loader: 'json'
    }]
  }
};

module.exports = config;
