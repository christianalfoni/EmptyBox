var fs = require('fs');
var React = require('react');
var url = require('url');
var AppWrapper = require('./../../common/AppWrapper.jsx');
var Blog = require('./../../blog/Blog.jsx');
var articles = require('./articles.js');

module.exports = function (url) {

  console.log('url', url);
  var state = {};
  var article = articles.getByUrl(url);
  state.articles = {
    current: article
  };
  var Wrapper = new AppWrapper(state, Blog);
  return React.renderToString(<Wrapper state={state}/>);

};
