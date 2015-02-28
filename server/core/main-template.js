var React = require('react');
var Baobab = require('baobab');
var Page = require('page');
var AppWrapper = require('./../common/AppWrapper.jsx');
var parseArticle = require('./../common/parseArticle');
var Blog = require('./Blog.jsx');

var store = new Baobab({{BLOG_STATE}}, {
  shiftReferences: true
});

var Wrapper = new AppWrapper(store.get(), Blog);
var render = function () {
  React.render(<Wrapper store={store}/>, document.body);
};

Page('/', function () {
    store.select('articles').set('current', null);
    render(); 
});

{{BLOG_ROUTES}}

Page.start();

if (module.hot) {
    module.hot.accept({{BLOG_HOTACCEPTS}}, function () {
      Page(location.pathname);
    });
}
