var fs = require('fs');
var React = require('react');
var url = require('url');
var AppWrapper = require('./../../common/AppWrapper.jsx');
var Blog = require('./../../blog/Blog.jsx');
var articles = require('./articles.js');

module.exports = function (path) {

  path = path.replace('/articles/', '');
  path = url.parse(path).pathname;

  var state = {};
  var article = articles.get(path);
  state.articles = {
    current: article
  };
  var Wrapper = new AppWrapper(state, Blog);
  return React.renderToString(<Wrapper state={state}/>);

};
