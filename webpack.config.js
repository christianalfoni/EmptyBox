var path = require('path');
var webpack = require('webpack');
var corePath = path.resolve(__dirname, 'core');
var node_modules_dir = path.resolve(__dirname, 'node_modules');
var reactPath = path.resolve(node_modules_dir, 'react', 'dist');
var buildPath = path.resolve(__dirname, 'build');

var config = {
  entry: [
    'webpack-dev-server/client?http://localhost:8080',
    'webpack/hot/only-dev-server',
    path.resolve(corePath, '_main.jsx')
  ],
  context: corePath,
  devtool: 'eval',
  output: {
    filename: 'blog.js',
    path: buildPath,
    publicPath: '/public/'
  },
  resolve: {
    alias: {
      'react/lib/ReactMount': path.resolve(node_modules_dir, 'react', 'lib', 'ReactMount'),
      'react/addons': path.resolve(reactPath, 'react.min.js')
    }
  },
  module: {
    noParse: [reactPath],
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
  plugins: [new webpack.HotModuleReplacementPlugin(), new webpack.NoErrorsPlugin()]
};

module.exports = config;
