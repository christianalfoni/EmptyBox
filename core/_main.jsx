// Add BLOG default state
global.BLOG_STATE = {"articles":[{"year":2015,"month":4,"date":1,"published":1427839200000,"title":"Functional Reactive Applications","description":"I want to take a step back from React JS, FLUX and cursors for a minute. There is a concept that has always intrigued me, but I have never quite understood it in the context of creating an application. The concept is **Functional Reactive Programming**. There are quite a few articles on the subject, but none of them really explains this concept in the context of building an application.","file":"2015_04_01_Functional-Reactive-Applications.md","url":"/articles/2015_04_01_Functional-Reactive-Applications"},{"year":2015,"month":2,"date":28,"published":1425078000000,"title":"A browserify workflow part 2","description":"I wrote an article on working with React JS in a browserify workflow. Well, I got some more experience with it and here is PART2. You can grab this boilerplate at [react-app-boilerplate](https://github.com/christianalfoni/react-app-boilerplate).","file":"2015_02_28_A-browserify-workflow-part-2.md","url":"/articles/2015_02_28_A-browserify-workflow-part-2"},{"year":2014,"month":8,"date":29,"published":1409263200000,"title":"Choosing the correct packaing tool for React js","description":"When new frameworks are released they rarely have a workflow suggestion included and maybe with good reason. There are lots of tools out there to set up a workflow and what you end up with probably differs based on the project your are working on. In this post I am going to try to give you an overview of how you can set up workflows with React JS using different packaging tools.","file":"2014_08_29_Choosing-the-correct-packaing-tool-for-React-js.md","url":"/articles/2014_08_29_Choosing-the-correct-packaing-tool-for-React-js"},{"year":2014,"month":8,"date":20,"published":1408485600000,"title":"React js and flux","description":"I am not going to take up your time explaining FLUX in details, that is already very well done on the [Facebook flux site](http://facebook.github.io/flux/). What I want to tell you about is why you would want to consider the flux architecture with React JS","file":"2014_08_20_React-js-and-flux.md","url":"/articles/2014_08_20_React-js-and-flux"}]};

Object.keys(global.SESSION_BLOG_STATE).forEach(function (key) {
  global.BLOG_STATE[key] = global.SESSION_BLOG_STATE[key];
});

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

Page('/articles/2015_04_01_Functional-Reactive-Applications', function (req) {
  document.body.classList.add('article-loading');
  store.set('loadingArticle', '/articles/2015_04_01_Functional-Reactive-Applications');
  store.commit();
  require.ensure(['./../posts/2015_04_01_Functional-Reactive-Applications.md'], function () {
    document.body.classList.remove('article-loading');
    var content = require('./../posts/2015_04_01_Functional-Reactive-Applications.md');
    store.select('articles', {file: '2015_04_01_Functional-Reactive-Applications.md'}).edit(parseArticle('2015_04_01_Functional-Reactive-Applications.md', content));
    if (store.select('currentArticle').get() !== '2015_04_01_Functional-Reactive-Applications.md') { document.body.scrollTop = 0; }
    store.set('currentArticle', '2015_04_01_Functional-Reactive-Applications.md');
    store.set('currentRoute', '/articles/2015_04_01_Functional-Reactive-Applications');
    store.set('loadingArticle', null);
    store.commit();
    render();
  });
});
Page('/articles/2015_02_28_A-browserify-workflow-part-2', function (req) {
  document.body.classList.add('article-loading');
  store.set('loadingArticle', '/articles/2015_02_28_A-browserify-workflow-part-2');
  store.commit();
  require.ensure(['./../posts/2015_02_28_A-browserify-workflow-part-2.md'], function () {
    document.body.classList.remove('article-loading');
    var content = require('./../posts/2015_02_28_A-browserify-workflow-part-2.md');
    store.select('articles', {file: '2015_02_28_A-browserify-workflow-part-2.md'}).edit(parseArticle('2015_02_28_A-browserify-workflow-part-2.md', content));
    if (store.select('currentArticle').get() !== '2015_02_28_A-browserify-workflow-part-2.md') { document.body.scrollTop = 0; }
    store.set('currentArticle', '2015_02_28_A-browserify-workflow-part-2.md');
    store.set('currentRoute', '/articles/2015_02_28_A-browserify-workflow-part-2');
    store.set('loadingArticle', null);
    store.commit();
    render();
  });
});
Page('/articles/2014_08_29_Choosing-the-correct-packaing-tool-for-React-js', function (req) {
  document.body.classList.add('article-loading');
  store.set('loadingArticle', '/articles/2014_08_29_Choosing-the-correct-packaing-tool-for-React-js');
  store.commit();
  require.ensure(['./../posts/2014_08_29_Choosing-the-correct-packaing-tool-for-React-js.md'], function () {
    document.body.classList.remove('article-loading');
    var content = require('./../posts/2014_08_29_Choosing-the-correct-packaing-tool-for-React-js.md');
    store.select('articles', {file: '2014_08_29_Choosing-the-correct-packaing-tool-for-React-js.md'}).edit(parseArticle('2014_08_29_Choosing-the-correct-packaing-tool-for-React-js.md', content));
    if (store.select('currentArticle').get() !== '2014_08_29_Choosing-the-correct-packaing-tool-for-React-js.md') { document.body.scrollTop = 0; }
    store.set('currentArticle', '2014_08_29_Choosing-the-correct-packaing-tool-for-React-js.md');
    store.set('currentRoute', '/articles/2014_08_29_Choosing-the-correct-packaing-tool-for-React-js');
    store.set('loadingArticle', null);
    store.commit();
    render();
  });
});
Page('/articles/2014_08_20_React-js-and-flux', function (req) {
  document.body.classList.add('article-loading');
  store.set('loadingArticle', '/articles/2014_08_20_React-js-and-flux');
  store.commit();
  require.ensure(['./../posts/2014_08_20_React-js-and-flux.md'], function () {
    document.body.classList.remove('article-loading');
    var content = require('./../posts/2014_08_20_React-js-and-flux.md');
    store.select('articles', {file: '2014_08_20_React-js-and-flux.md'}).edit(parseArticle('2014_08_20_React-js-and-flux.md', content));
    if (store.select('currentArticle').get() !== '2014_08_20_React-js-and-flux.md') { document.body.scrollTop = 0; }
    store.set('currentArticle', '2014_08_20_React-js-and-flux.md');
    store.set('currentRoute', '/articles/2014_08_20_React-js-and-flux');
    store.set('loadingArticle', null);
    store.commit();
    render();
  });
});


Page.start();

if (module.hot) {
    module.hot.accept(["./../posts/2015_04_01_Functional-Reactive-Applications.md","./../posts/2015_02_28_A-browserify-workflow-part-2.md","./../posts/2014_08_29_Choosing-the-correct-packaing-tool-for-React-js.md","./../posts/2014_08_20_React-js-and-flux.md"], function () {
      Page(location.pathname);
    });
}
