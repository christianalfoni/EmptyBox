var path = require('path');
var webpack = require('webpack');
var corePath = path.resolve(__dirname, 'core');
var node_modules_dir = path.resolve(__dirname, 'node_modules');
var reactPath = path.resolve(node_modules_dir, 'react', 'dist');
var publicPath = path.resolve(__dirname, 'public');

var config = {
  entry: [
    path.resolve(corePath, '_main.jsx')
  ],
  context: corePath,
  output: {
    filename: 'blog.js',
    path: publicPath,
    publicPath: '/public/'
  },
  module: {
    loaders: [{
      test: /\.jsx$/,
      loaders: ['react-hot', 'babel'],
      exclude: [node_modules_dir]
    }, {
      test: /\.md$/,
      loader: 'raw'
    }, {
      test: /\.css$/,
      loader: 'style!css'
    }, {
      test: /\.json$/,
      loader: 'json'
    }]
  },
  plugins: [new webpack.optimize.UglifyJsPlugin({
    compress: {
        warnings: false
    }
  })]
};

module.exports = config;
