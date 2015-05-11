var httpProxy = require('http-proxy');
var express = require('express');
var compress = require('compression');
var path = require('path');
var Promise = require('es6-promise').Promise;
var rss = require('./rss.js');
var packageJson = require('./../../package.json');
var renderBlog = require('./renderBlog.jsx');
var loadIndex = require('./loadIndex.js');
var articles = require('./articles.js');
var bundler = require('./bundler.js');
var writeEntry = require('./writeEntry.js');
var fonts = require('./fonts.js');
var utils = require('./utils.js');

var index = 'Index files not loaded yet';

module.exports = function (app) {

  if (global.isProduction) {

    app.use(compress()); 

    Promise.all([
        loadIndex(),
        articles.load(),
        fonts.load()
      ])
      .then(function (results) {
        index = results[0];
        index = index.replace('{{FONTS}}', fonts.getCSS());
        return writeEntry(results[1]);
      })
      .then(bundler.bundleProduction)
      .then(function () {
        console.log('Production bundle is ready');
      })
      .catch(function (err) {
        console.error('Something wrong happened when bundling for production', err);
      });

    app.use('/public', express.static(path.resolve(__dirname, '..', '..', 'public')));

    app.get('/', function (req, res) {
      var blogHtml = renderBlog(req.path);
      var html = index.replace('{{BLOG_TITLE}}', packageJson.name);
      html = html.replace('{{BLOG}}', blogHtml);
      html = html.replace('{{SESSION_BLOG_STATE}}', JSON.stringify({}));
      res.type('html');
      res.send(html);  
    });

    app.get('/articles/*', function (req, res) {
      var blogHtml = renderBlog(req.path);
      var article = articles.getByUrl(req.path);
      var html = index.replace('{{BLOG_TITLE}}', packageJson.name + ' - ' + article.title);
      html = html.replace('{{BLOG}}', blogHtml);
      html = html.replace('{{SESSION_BLOG_STATE}}', JSON.stringify({
        currentArticle: req.params[0] + '.md'
      }));
      res.type('html');
      res.send(html);
    });

    app.get('/rss', rss);

    app.listen(8080, function () {
      console.log('Blog ready at localhost:3000');
    });

  } else {

    var proxy = httpProxy.createProxyServer({
      changeOrigin: true
    });

    app.use('/fonts', express.static(path.resolve(__dirname, '..', '..', 'public', 'fonts')));

    app.get('/', function (req, res) {
      Promise.all([
          loadIndex(),
          articles.load()
        ])
        .then(function (results) {
          index = results[0];
          return writeEntry(results[1]);
        })
        .then(function (results) {
          var blogHtml = renderBlog();
          index = index.replace('{{BLOG_TITLE}}', packageJson.name);
          index = index.replace('{{BLOG}}', blogHtml);
          index = index.replace('{{FONTS}}', fonts.getCSS());
          index = index.replace('{{SESSION_BLOG_STATE}}', JSON.stringify({}));
          res.type('html');
          res.send(index);
        })
        .catch(function (err) {
          console.error('Could not load index', err.stack);
        });

    });

    app.get('/articles/*', function (req, res) {

      Promise.all([
          loadIndex(),
          articles.load()
        ])
        .then(function (results) {
          index = results[0];
          return writeEntry(results[1]);
        })
        .then(function () {
          var blogHtml = renderBlog(req.path);
          var article = articles.getByUrl(req.path);
          index = index.replace('{{BLOG_TITLE}}', packageJson.name + ' - ' + article.title);
          index = index.replace('{{BLOG}}', blogHtml);
          index = index.replace('{{FONTS}}', fonts.getCSS());
          index = index.replace('{{SESSION_BLOG_STATE}}', JSON.stringify({currentArticle: req.params[0] + '.md'}));
          res.type('html');
          res.send(index);
        })
        .catch(function (err) {
          console.error('Could not load index', err.stack);
        });

    });

    app.get('/rss', rss);

    app.all('*', function (req, res) {
      proxy.web(req, res, {
        target: 'http://localhost:8080/'
      });
    });

    Promise.all([
        loadIndex(),
        articles.load(),
        fonts.load()
      ])
      .then(function (results) {
        return writeEntry(results[1]);
      })
      .then(function () {
        bundler.bundleDev().listen(8080, "localhost", function () {
          console.log('Bundling blog, please wait...');
        });
      })
      .catch(function (err) {
        console.log('error creating initial bundle', err, err.stack);
      });

    app.listen(3000, function () {
      console.log('Blog ready at localhost:3000');
    });

  }

  return app;

};
