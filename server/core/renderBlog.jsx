var fs = require('fs');
var React = require('react');
var url = require('url');
var Blog = require('./../../blog/Blog.jsx');
var store = require('./../../common/store.js');
var articles = require('./articles.js');

module.exports = function (url) {

  var article = url ? articles.getByUrl(url) : null;
  store.set('articles', articles.getAllWithoutContent());
  store.set('currentArticle', article);
  store.commit();
  var html = React.renderToString(<Blog/>);
  store.release();
  return html;

};
