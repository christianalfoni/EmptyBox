var fs = require('fs');
var path = require('path');
var Promise = require('es6-promise').Promise;

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
    fs.writeFile(path.resolve(__dirname, '..', '..', 'blog', '_main.jsx'), template, function (err) {
      if (err) {
        return reject('Could not write main file', err);
      }
      resolve();
    });
  });  
};

var injectRoutes = function (articles, template) {
  var routes = Object.keys(articles).map(function (article) {
    return [
      'Page(\'/articles/' + article + '\', function (req) {\n',
      '  require.ensure([\'./../posts/' + article + '\'], function () {\n',
      '    var article = require(\'./../posts/' + article + '\');\n',
      '    store.get().articles.set(\'current\', article);\n',
      '    render(store.get());\n',
      '  });\n',
      '});'
    ].join('');
  });
  return template.replace('{{BLOG_ROUTES}}', routes.join(''));
};

// Todo: Add first parapraph from article
var injectState = function (state, articles, template) {
  state.articles = state.articles || {};
  state.articles.list = Object.keys(articles);
  return template.replace('{{BLOG_STATE}}', JSON.stringify(state));
};

var injectHotAccepts = function (articles, template) {
  var hotAccepts = Object.keys(articles).map(function (article) {
    return './../posts/' + article;
  });
  return template.replace('{{BLOG_HOTACCEPTS}}', JSON.stringify(hotAccepts));
};

module.exports = function (articles, state) {
  state = state || {};
  return readFile()
    .then(function (template) {
      template = injectRoutes(articles, template);
      template = injectState(state, articles, template);
      template = injectHotAccepts(articles, template);
      return writeFile(template);
    });
};
