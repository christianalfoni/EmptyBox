var fs = require('fs');
var path = require('path');
var Promise = require('es6-promise').Promise;
var articlesPath = path.resolve(__dirname, '..', '..', 'posts');
var articles = {};

var readArticle = function (article) {
  return new Promise(function (resolve, reject) {
    fs.readFile(path.resolve(articlesPath, article), function (err, content) {
      if (err) {
        return console.log('Could not load article', err);
      }
      articles[article] = content.toString();
      resolve(content);
    });
  });
};

var readArticles = function () {
  return new Promise(function (resolve, reject) {
    fs.readdir(articlesPath, function (err, files) {
      if (err) {
        console.error('Error loading articles', err);
      }
      resolve(files);
    });
  });
};

module.exports = {
  load: function () {
    return readArticles()
      .then(function (files) {
        return Promise.all(files.map(readArticle))
          .then(function () {
            console.log('Read all articles');
            return articles;
          })
          .catch(function (err) {
            console.log('Could not read articles', err);
          })
      });
  },
  get: function (name) {
    return articles[name];
  }
};
