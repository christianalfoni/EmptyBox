var path = require('path');
var webpack = require('webpack');
var blogPath = path.resolve(__dirname, 'blog');
var node_modules_dir = path.resolve(__dirname, 'node_modules');
var reactPath = path.resolve(node_modules_dir, 'react', 'dist');
var publicPath = path.resolve(__dirname, 'public');

var config = {
  entry: [
    path.resolve(blogPath, '_main.jsx')
  ],
  context: blogPath,
  output: {
    filename: 'blog.js',
    path: publicPath,
    publicPath: '/public/'
  },
  module: {
    loaders: [{
      test: /\.jsx$/,
      loaders: ['react-hot', 'jsx'],
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
  }
};

module.exports = config;
