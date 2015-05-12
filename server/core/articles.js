var fs = require('fs');
var path = require('path');
var utils = require('./utils.js');
var Promise = require('es6-promise').Promise;
var parseArticle = require('./../../common/parseArticle.js');
var articlesPath = path.resolve(__dirname, '..', '..', 'posts');
var draftsPath = path.resolve(__dirname, '..', '..', 'drafts');
var articles = [];

var readArticle = function(article) {

  var match = article.filename.match(/[0-9]{4}_[0-9]{2}_[0-9]{2}_((?!_).)*\.md$/)
  var isDraft = !!article.path.match(/drafts/);
  if (!match) {
    throw new Error('You have an article with wrong file convention');
  }

  article.filename = match[0];

  return new Promise(function(resolve, reject) {
    fs.readFile(path.resolve(article.path, article.filename), function(err, content) {
      if (err) {
        return console.log('Could not load article', err);
      }
      articles.push(parseArticle(article.filename, content.toString(), isDraft));
      resolve(content);
    });
  });
};

var readArticles = function(dir) {
  return new Promise(function(resolve, reject) {
    fs.readdir(dir, function(err, files) {
      if (err) {
        console.error('Error loading articles', err);
      }
      resolve(files.map(function (file) {
        return {
          path: dir,
          filename: file
        };
      }));
    });
  });
};

var sortByDate = function() {
  articles.sort(function(a, b) {
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
  load: function() {
    var dirs = global.isProduction ? [articlesPath] : [draftsPath, articlesPath];
    articles = [];
    return Promise.all(dirs.map(function(dir) {
        return readArticles(dir);
      }))
      .then(function(files) {
        files = utils.flatten(files);
        return Promise.all(files.map(readArticle))
          .then(function() {
            sortByDate();
            return articles;
          });
      })
      .catch(function(err) {
        console.error('Could not read articles', err);
      });
  },
  getByUrl: function(url) {
    return articles.filter(function(article) {
      return article.url === url;
    }).pop();
  },
  getAllWithoutContent: function() {
    return articles.map(function(article) {
      return Object.keys(article).reduce(function(articleWithoutContent, key) {
        if (key !== 'content') {
          articleWithoutContent[key] = article[key];
        }
        return articleWithoutContent;
      }, {})
    });
  }
};
