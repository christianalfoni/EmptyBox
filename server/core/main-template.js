// Add BLOG default state
global.BLOG_STATE = {{BLOG_STATE}};

var React = require('react');
var Page = require('page');
var store = require('./../common/store.js');
var parseArticle = require('./../common/parseArticle');
var Blog = require('./Blog.jsx');

var render = function () {
  React.render(<Blog/>, document.body);
};

Page('/', function () {
    store.set('currentArticle', null);
    render();
});

{{BLOG_ROUTES}}

Page.start();

if (module.hot) {
    module.hot.accept({{BLOG_HOTACCEPTS}}, function () {
      Page(location.pathname);
    });
}
