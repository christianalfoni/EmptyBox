var React = require('react');
var Freezer = require('freezer-js');
var Page = require('page');
var AppWrapper = require('./../common/AppWrapper.jsx');
var Blog = require('./Blog.jsx');

var store = new Freezer({{BLOG_STATE}});

var Wrapper = new AppWrapper(store.get(), Blog);
var render = function (storeState) {
  React.render(<Wrapper state={storeState}/>, document.body);
};

Page('/', function () {
    store.get().articles.set('current', null);
    render(store.get()); 
});

{{BLOG_ROUTES}}

Page.start();

if (module.hot) {
    module.hot.accept({{BLOG_HOTACCEPTS}}, function () {
      Page(location.pathname);
    });
}
