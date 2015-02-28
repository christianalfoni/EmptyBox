var React = require('react');
var Freezer = require('freezer-js');
var Page = require('page');
var AppWrapper = require('./../common/AppWrapper.jsx');
var Blog = require('./Blog.jsx');

var store = new Freezer({"articles":{"list":[{"title":"test","published":1425078000000,"description":"No content","url":"/articles/2015_02_28_test"}]}});

var Wrapper = new AppWrapper(store.get(), Blog);
var render = function (storeState) {
  React.render(<Wrapper state={storeState}/>, document.body);
};

Page('/', function () {
    store.get().articles.set('current', null);
    render(store.get()); 
});

Page('/articles/2015_02_28_test', function (req) {
  require.ensure(['./../posts/2015_02_28_test.md'], function () {
    var article = require('./../posts/2015_02_28_test.md');
    store.get().articles.set('current', article);
    render(store.get());
  });
});

Page.start();

if (module.hot) {
    module.hot.accept(["./../posts/2015_02_28_test.md"], function () {
      Page(location.pathname);
    });
}
