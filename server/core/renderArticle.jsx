var fs = require('fs');
var React = require('react');
var url = require('url');
var AppWrapper = require('./../../common/AppWrapper.jsx');
var Blog = require('./../../blog/Blog.jsx');
var articles = require('./articles.js');

module.exports = function (url) {

  var store = {};
  var article = articles.getByUrl(url);
  store.articles = {
    current: article
  };
  var Wrapper = new AppWrapper(store, Blog);
  return React.renderToString(<Wrapper store={store}/>);

};
