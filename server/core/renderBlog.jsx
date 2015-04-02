var fs = require('fs');
var path = require('path');
var React = require('react');
var url = require('url');
var store = require('./../../common/store.js');
var articles = require('./articles.js');
var Blog = require('./../../blog/Blog.jsx');

module.exports = function (url) {

  if (!global.isProduction) {
    delete require.cache[path.resolve(__dirname, '..', '..', 'blog', 'Blog.jsx')];
    Blog = require('./../../blog/Blog.jsx');
  }

  var article = url ? articles.getByUrl(url) : null;
  store.set('articles', articles.getAllWithoutContent());
  store.commit();
  if (article) {
    store.select('articles', {file: article.file}).edit(article);
    store.set('currentArticle', article.file);
    store.commit();
  }
  var html = React.renderToString(<Blog/>);
  //store.release();
  return html;

};
