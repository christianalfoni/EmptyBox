var fs = require('fs');
var path = require('path');
var Promise = require('es6-promise').Promise;
var marked = require('marked');
var articles = require('./articles.js');

var readFile = function () {
  return new Promise(function (resolve, reject) {
    fs.readFile(path.resolve(__dirname, 'main-template.js'), function (err, file) {
      if (err) {
        return reject('Could not read main template', err);
      }
      resolve(file.toString());
    });
  });
};

var writeFile = function (template) {
  return new Promise(function (resolve, reject) {
    fs.writeFile(path.resolve(__dirname, '..', '..', 'core', '_main.jsx'), template, function (err) {
      if (err) {
        return reject('Could not write main file', err);
      }
      resolve();
    });
  });  
};

var injectRoutes = function (articles, template) {
  var routes = articles.map(function (article) {
    return [
      'Page(\'' + article.url + '\', function (req) {\n',
      '  require.ensure([\'./../posts/' + article.file + '\'], function () {\n',
      '    var content = require(\'./../posts/' + article.file + '\');\n',
      '    store.set(\'currentArticle\', parseArticle(\'' + article.file + '\', content));\n',
      '    store.set(\'currentRoute\', \'' + article.url + '\');',
      '    render();\n',
      '  });\n',
      '});'
    ].join('');
  });
  return template.replace('{{BLOG_ROUTES}}', routes.join(''));
};

// Todo: Add first parapraph from article
var injectState = function (state, template) {
  state.articles = articles.getAllWithoutContent();
  return template.replace('{{BLOG_STATE}}', JSON.stringify(state));
};

var injectHotAccepts = function (articles, template) {
  var hotAccepts = articles.map(function (article) {
    return './../posts/' + article.file;
  });
  return template.replace('{{BLOG_HOTACCEPTS}}', JSON.stringify(hotAccepts));
};

var injectBaseCSS = function (template) {
  if (global.isProduction) {
    return template;
  }
  var baseCSS = [
    'require(\'./../styles/base.css\')',
    'require(\'./../styles/base-layout.css\')',
    'require(\'./../styles/base-components.css\')'
  ].join('\n');
  return template.replace('{{BASE_CSS_IN_DEV}}', baseCSS)
};

module.exports = function (articles, state) {
  state = state || {};
  return readFile()
    .then(function (template) {
      template = injectRoutes(articles, template);
      template = injectBaseCSS(template);
      template = injectState(state, template);
      template = injectHotAccepts(articles, template);
      return writeFile(template);
    });
};
