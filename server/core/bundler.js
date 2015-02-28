var Promise = require('es6-promise').Promise;
var WebpackDevServer = require("webpack-dev-server");
var webpack = require("webpack");
var path = require('path');
var buildPath = path.resolve(__dirname, '..', '..', 'build');
var config;
  
if (global.isProduction) {
  config = require('./../../webpack.production.config.js');
} else {
  config = require('./../../webpack.config.js');
}

module.exports = {
  bundleDev: function () {
    var compiler = webpack(config);
    return new WebpackDevServer(compiler, {
      contentBase: buildPath,
      hot: true,
      quiet: false,
      noInfo: false,
      publicPath: '/public/',
      stats: {
        colors: true
      },
      historyApiFallback: true
    });
  },
  bundleProduction: function () {
    return new Promise(function (resolve, reject) {
      var compile = webpack(config, function () {
        resolve();
      });
    })
  }
};
