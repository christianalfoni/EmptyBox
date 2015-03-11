var fs = require('fs');
var path = require('path');
var React = require('react');
var url = require('url');
var store = require('./../../common/store.js');
var articles = require('./articles.js');
var Blog;

if (global.isProduction) {
  Blog = require('./../../blog/Blog.jsx');
}

module.exports = function (url) {

  if (!global.isProduction) {
    Blog = require('./../../blog/Blog.jsx');
    delete require.cache[path.resolve(__dirname, '..', '..', 'blog', 'Blog.jsx')];
  }
  var article = url ? articles.getByUrl(url) : null;
  store.set('articles', articles.getAllWithoutContent());
  store.set('currentArticle', article);
  store.commit();
  var html = React.renderToString(<Blog/>);
  store.release();
  return html;

};
