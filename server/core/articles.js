var fs = require('fs');
var path = require('path');
var Promise = require('es6-promise').Promise;
var parseArticle = require('./../../common/parseArticle.js');
var articlesPath = path.resolve(__dirname, '..', '..', 'posts');
var articles = [];

var readArticle = function (article) {

  var match = article.match(/[0-9]{4}_[0-9]{2}_[0-9]{2}_((?!_).)*\.md$/)

  if (!match) {
    throw new Error('You have an article with wrong file convention');
  }

  article = match[0];

  return new Promise(function (resolve, reject) {
    fs.readFile(path.resolve(articlesPath, article), function (err, content) {
      if (err) {
        return console.log('Could not load article', err);
      }
      articles.push(parseArticle(article, content.toString()));
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

var sortByDate = function () {
  articles.sort(function (a, b) {
    if (a.year > b.year) {
      return -1;
    }
    if (a.year === b.year) {
      if (a.month > b.month) {
        return -1;
      }
      if (a.month === b.month) {
        if (a.date > b.date) {
          return -1;
        }
        return 1;
      }
      return 1;
    }
    return 1;
  });
};

module.exports = {
  load: function () {
    articles = [];
    return readArticles()
      .then(function (files) {
        return Promise.all(files.map(readArticle))
          .then(function () {
            console.log('Updated articles');
            sortByDate();
            return articles;
          });
      })
      .catch(function (err) {
        console.error('Could not read articles', err);
      });
  },
  getByUrl: function (url) {
    return articles.filter(function (article) {
      return article.url === url;
    }).pop();
  },
  getAllWithoutContent: function () {
    return articles.map(function (article) {
      return Object.keys(article).reduce(function (articleWithoutContent, key) {
        if (key !== 'content') {
          articleWithoutContent[key] = article[key];
        }
        return articleWithoutContent;
      }, {})
    });
  }
};
