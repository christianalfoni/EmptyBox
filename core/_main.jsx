// Add BLOG default state
global.BLOG_STATE = {"articles":[{"year":2015,"month":2,"date":28,"published":1425078000000,"title":"A browserify workflow part 2","description":"I wrote an article on working with React JS in a browserify workflow. Well, I got some more experience with it and here is PART2. You can grab this boilerplate at [react-app-boilerplate](https://github.com/christianalfoni/react-app-boilerplate).","file":"2015_02_28_A-browserify-workflow-part-2.md","url":"/articles/2015_02_28_A-browserify-workflow-part-2"},{"year":2014,"month":8,"date":20,"published":1408485600000,"title":"React js and flux","description":"I am not going to take up your time explaining FLUX in details, that is already very well done on the [Facebook flux site](http://facebook.github.io/flux/). What I want to tell you about is why you would want to consider the flux architecture with React JS","file":"2014_08_20_React-js-and-flux.md","url":"/articles/2014_08_20_React-js-and-flux"}]};

require('./../styles/base.css')
require('./../styles/base-layout.css')
require('./../styles/base-components.css')

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

Page('/articles/2015_02_28_A-browserify-workflow-part-2', function (req) {
  require.ensure(['./../posts/2015_02_28_A-browserify-workflow-part-2.md'], function () {
    var content = require('./../posts/2015_02_28_A-browserify-workflow-part-2.md');
    store.set('currentArticle', parseArticle('2015_02_28_A-browserify-workflow-part-2.md', content));
    store.set('currentRoute', '/articles/2015_02_28_A-browserify-workflow-part-2');    render();
  });
});Page('/articles/2014_08_20_React-js-and-flux', function (req) {
  require.ensure(['./../posts/2014_08_20_React-js-and-flux.md'], function () {
    var content = require('./../posts/2014_08_20_React-js-and-flux.md');
    store.set('currentArticle', parseArticle('2014_08_20_React-js-and-flux.md', content));
    store.set('currentRoute', '/articles/2014_08_20_React-js-and-flux');    render();
  });
});

Page.start();

if (module.hot) {
    module.hot.accept(["./../posts/2015_02_28_A-browserify-workflow-part-2.md","./../posts/2014_08_20_React-js-and-flux.md"], function () {
      Page(location.pathname);
    });
}
