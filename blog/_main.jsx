var React = require('react');
var Freezer = require('freezer-js');
var Page = require('page');
var AppWrapper = require('./../common/AppWrapper.jsx');
var Blog = require('./Blog.jsx');

var store = new Freezer({
  articles: {
    current: ''
  }
});

var Wrapper = new AppWrapper(store.get(), Blog);
var render = function (storeState) {
  React.render(<Wrapper state={storeState}/>, document.body);
};

Page('/', function () {
    store.get().articles.set('current', null);
    render(store.get()); 
});

Page('/articles/test.md', function (req) {
   require.ensure(['./../posts/test.md'], function () {
    var article = require('./../posts/test.md');
    store.get().articles.set('current', article);
    render(store.get()); 
  }); 
});

Page.start();

if (module.hot) {
    module.hot.accept(['./../posts/test.md'], function () {
      Page(location.pathname);
    });
}
