var httpProxy = require('http-proxy');
var fs = require('fs');
var path = require('path');
var packageJson = require('./../../package.json');
var renderArticle = require('./renderArticle.jsx');
var loadIndex = require('./loadIndex.js');
var articles = require('./articles.js');
var bundler = require('./bundler.js');

var index = 'Index files not loaded yet';
articles.load();

module.exports = function (app) {

  if (global.isProduction) {

    loadIndex()
      .then(function (loadedIndex) {
        index = loadedIndex;
        return bundler.bundleProduction();
      })
      .then(function () {
        console.log('Production bundle is ready');
      })
      .catch(function (err) {
        console.error('Something wrong happened when bundling for production', err);
      });

    app.use('/public', express.static(path.resolve(__dirname, '..', '..', 'public')));

    app.get('*', function (req, res) {
      var blogHtml = renderArticle(req.path);
      res.type('html');
      res.send(index.replace('{{BLOG}}', blogHtml));
    });

    app.listen(3000, function () {
      console.log('Blog ready at localhost:3000');
    });

  } else {

    var proxy = httpProxy.createProxyServer({
      changeOrigin: true
    });

    app.get('/', function (req, res) {

      loadIndex()
        .then(function (index) {
          index = index.replace('{{BLOG}}', 'Front page');
          res.type('html');
          res.send(index);
        })
        .catch(function (err) {
          console.error('Could not load index', err.stack);
        });

    });

    app.get('/articles/*', function (req, res) {

      loadIndex()
        .then(function (index) {
          var blogHtml = renderArticle(req.path);
          index = index.replace('{{BLOG}}', blogHtml);
          res.type('html');
          res.send(index);
        })
        .catch(function (err) {
          console.error('Could not load index', err.stack);
        });

    });

    app.all('*', function (req, res) {
      proxy.web(req, res, {
        target: 'http://localhost:8080/'
      });
    });

    bundler.bundleDev().listen(8080, "localhost", function () {
      console.log('Ready to bundle blog');
      app.listen(3000, function () {
        console.log('Blog ready at localhost:3000');
      });
    });

  }

  return app;

};
