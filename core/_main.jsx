// Add BLOG default state
global.BLOG_STATE = {"articles":[{"year":2015,"month":2,"date":28,"published":1425078000000,"title":"test","description":"I wrote an article on working with React JS in a browserify workflow. Well, I got some more experience with it and here is PART2. You can grab this boilerplate at [react-app-boilerplate](https://github.com/christianalfoni/react-app-boilerplate).","file":"2015_02_28_test.md","url":"/articles/2015_02_28_test"}]};

require('./../styles/base.css')
require('./../styles/base-layout.css')
require('./../styles/base-components.css')

// Fonts handling
require('./_fonts.css');
window.onload = function () {
  document.body.className = document.body.className.replace('fonts-loading', 'fonts-loaded'); 
};


var React = require('react');
var Page = require('page');
var store = require('./../common/store.js');
var parseArticle = require('./../common/parseArticle');
var Blog = require('./../blog/Blog.jsx');

var render = function () {
  React.render(<Blog/>, document.body);
};

Page('/', function () {
    store.set('currentArticle', null);
    store.set('currentRoute', '/');
    render();
});

Page('/articles/2015_02_28_test', function (req) {
  require.ensure(['./../posts/2015_02_28_test.md'], function () {
    var content = require('./../posts/2015_02_28_test.md');
    store.set('currentArticle', parseArticle('2015_02_28_test.md', content));
    store.set('currentRoute', '/articles/2015_02_28_test');    render();
  });
});

Page.start();

if (module.hot) {
    module.hot.accept(["./../posts/2015_02_28_test.md"], function () {
      Page(location.pathname);
    });
}
