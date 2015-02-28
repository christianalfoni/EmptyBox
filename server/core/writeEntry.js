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
  var routes = articles.map(function (article) {
    return [
      'Page(\'' + article.url + '\', function (req) {\n',
      '  require.ensure([\'./../posts/' + article.file + '\'], function () {\n',
      '    var article = require(\'./../posts/' + article.file + '\');\n',
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
  state.articles.list = articles.map(function (article) {
    var description = article.content.match(/\<p\>.*?\<\/p\>/);
    return {
      title: article.title,
      published: new Date(article.year, article.month - 1, article.date).getTime(),
      description: description ? description[0] : 'No content',
      url: article.url
    };
  });
  return template.replace('{{BLOG_STATE}}', JSON.stringify(state));
};

var injectHotAccepts = function (articles, template) {
  var hotAccepts = articles.map(function (article) {
    return './../posts/' + article.file;
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
