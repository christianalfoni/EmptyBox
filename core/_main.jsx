// Add BLOG default state
global.BLOG_STATE = {"articles":[{"year":2015,"month":4,"date":19,"published":1429394400000,"title":"The ultimate webpack setup","description":"I have already written [an article](http://christianalfoni.com/articles/2014_12_13_Webpack-and-react-is-awesome) on using Webpack for your React application. Now I have more experience and want to share a really awesome setup we use at my employer, **Gloppens EDB Lag**, that gives you a great workflow expanding beyond the concepts of Webpack and makes it easy to do continuous deployment. ","file":"2015_04_19_The-ultimate-webpack-setup.md","url":"/articles/2015_04_19_The-ultimate-webpack-setup"},{"year":2015,"month":4,"date":1,"published":1427839200000,"title":"Functional Reactive Applications","description":"I want to take a step back from React JS, FLUX and cursors for a minute. There is a concept that has always intrigued me, but I have never quite understood it in the context of creating an application. The concept is **Functional Reactive Programming**. There are quite a few articles on the subject, but none of them really explains this concept in the context of building an application.","file":"2015_04_01_Functional-Reactive-Applications.md","url":"/articles/2015_04_01_Functional-Reactive-Applications"},{"year":2015,"month":3,"date":1,"published":1425164400000,"title":"True isomorphic apps with React and Baobab","description":"So this little library Baobab continues to surprise me. The [previous article](http://christianalfoni.github.io/javascript/2015/02/06/plant-a-baobab-tree-in-your-flux-application.html) I wrote on this used a strategy where you would lock up all your components, but have a dependency to the state tree of the application in each component that needed it. The individual components could point cursors into the state tree, allowing the component to extract state from the state tree and render itself whenever the cursor notified about a change. This optimized the rendering of React JS and gave a very good FLUX structure to your application.","file":"2015_03_01_True-isomorphic-apps-with-React-and-Baobab.md","url":"/articles/2015_03_01_True-isomorphic-apps-with-React-and-Baobab"},{"year":2015,"month":2,"date":22,"published":1424559600000,"title":"The great Angular component experiment","description":"My last months has been heavily devoted to understanding React JS and FLUX patterns. In parallell with this I have been helping out on an Angular project. Angular was chosen because the guy who got me involved is a Java developer, and of course he likes Angular. In these months working together there has been a lot of discussion on, \"Why does Java developers love Angular?\". I have given my cents on React JS, using components, and the one way flow of FLUX. The discussions has not been in the form of \"one is better than the other\", but despite his open mind, it was very difficult to explain what makes React JS and FLUX so great.","file":"2015_02_22_The-great-Angular-component-experiment.md","url":"/articles/2015_02_22_The-great-Angular-component-experiment"},{"year":2015,"month":2,"date":6,"published":1423177200000,"title":"Plant a Baobab tree in your flux application","description":"All standards, libraries, practices, architectures and patterns needs some time to evolve before becoming widely accepted. The flux architecture is no different. After Facebook released their React JS project the suggested flux architecture has evolved into many different shapes and colors. Some of them more accepted than others. In this article we are going to look at what challenges exists today with the flux architecture. We are also going to look at a solution that I think is a great contribution to the evolution of flux.","file":"2015_02_06_Plant-a-Baobab-tree-in-your-flux-application.md","url":"/articles/2015_02_06_Plant-a-Baobab-tree-in-your-flux-application"},{"year":2015,"month":1,"date":1,"published":1420066800000,"title":"Think twice about ES6 classes","description":"I got into JavaScript about 5 years ago and I have no to very little experience with other languages. That can sometimes be a bad thing, but it can also be a very good thing. In this article I am going to talk about classes, which is coming to the next version of JavaScript. I am going to talk about why I do not understand developers simulating classes and class inheritance in JavaScript and why I think it is not a very good idea to bring the concept into JavaScript at all.","file":"2015_01_01_Think-twice-about-ES6-classes.md","url":"/articles/2015_01_01_Think-twice-about-ES6-classes"},{"year":2014,"month":12,"date":13,"published":1418425200000,"title":"Webpack and react is awesome","description":"Previously I have written a couple of articles about how to set up a workflow with React JS. The solution provided was [browserify](http://browserify.org) with [gulp](http://gulpjs.com). If React JS is not your thing I think you still will get a lot of value out of this article, so please read on. ","file":"2014_12_13_Webpack-and-react-is-awesome.md","url":"/articles/2014_12_13_Webpack-and-react-is-awesome"},{"year":2014,"month":10,"date":30,"published":1414623600000,"title":"A browserify workflow part 2","description":"I wrote an article on working with React JS in a browserify workflow. Well, I got some more experience with it and here is PART2. You can grab this boilerplate at [react-app-boilerplate](https://github.com/christianalfoni/react-app-boilerplate).","file":"2014_10_30_A-browserify-workflow-part-2.md","url":"/articles/2014_10_30_A-browserify-workflow-part-2"},{"year":2014,"month":10,"date":22,"published":1413928800000,"title":"Nailing that validation with React JS","description":"Validation is complex. Validation is extremely complex. I think it is right up there at the top of implementations we misjudge regarding complexity. So why is validation so difficult in general? How could we implement this with React JS? And do you get a prize for reading through this article? ... yep, you do! Look forward to a virtual cookie at the bottom of this article, you will definitely deserve it ;-)","file":"2014_10_22_Nailing-that-validation-with-React-JS.md","url":"/articles/2014_10_22_Nailing-that-validation-with-React-JS"},{"year":2014,"month":8,"date":29,"published":1409263200000,"title":"Choosing the correct packaging tool for React js","description":"When new frameworks are released they rarely have a workflow suggestion included and maybe with good reason. There are lots of tools out there to set up a workflow and what you end up with probably differs based on the project your are working on. In this post I am going to try to give you an overview of how you can set up workflows with React JS using different packaging tools.","file":"2014_08_29_Choosing-the-correct-packaging-tool-for-React-js.md","url":"/articles/2014_08_29_Choosing-the-correct-packaging-tool-for-React-js"},{"year":2014,"month":8,"date":20,"published":1408485600000,"title":"React js and flux","description":"I am not going to take up your time explaining FLUX in details, that is already very well done on the [Facebook flux site](http://facebook.github.io/flux/). What I want to tell you about is why you would want to consider the flux architecture with React JS","file":"2014_08_20_React-js-and-flux.md","url":"/articles/2014_08_20_React-js-and-flux"}]};

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

Page('/articles/2015_04_19_The-ultimate-webpack-setup', function (req) {
  document.body.classList.add('article-loading');
  store.set('loadingArticle', '/articles/2015_04_19_The-ultimate-webpack-setup');
  store.commit();
  require.ensure(['./../posts/2015_04_19_The-ultimate-webpack-setup.md'], function () {
    document.body.classList.remove('article-loading');
    var content = require('./../posts/2015_04_19_The-ultimate-webpack-setup.md');
    store.select('articles', {file: '2015_04_19_The-ultimate-webpack-setup.md'}).edit(parseArticle('2015_04_19_The-ultimate-webpack-setup.md', content));
    if (store.select('currentArticle').get() !== '2015_04_19_The-ultimate-webpack-setup.md') { document.body.scrollTop = 0; }
    store.set('currentArticle', '2015_04_19_The-ultimate-webpack-setup.md');
    store.set('currentRoute', '/articles/2015_04_19_The-ultimate-webpack-setup');
    store.set('loadingArticle', null);
    store.commit();
    render();
  });
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
Page('/articles/2015_03_01_True-isomorphic-apps-with-React-and-Baobab', function (req) {
  document.body.classList.add('article-loading');
  store.set('loadingArticle', '/articles/2015_03_01_True-isomorphic-apps-with-React-and-Baobab');
  store.commit();
  require.ensure(['./../posts/2015_03_01_True-isomorphic-apps-with-React-and-Baobab.md'], function () {
    document.body.classList.remove('article-loading');
    var content = require('./../posts/2015_03_01_True-isomorphic-apps-with-React-and-Baobab.md');
    store.select('articles', {file: '2015_03_01_True-isomorphic-apps-with-React-and-Baobab.md'}).edit(parseArticle('2015_03_01_True-isomorphic-apps-with-React-and-Baobab.md', content));
    if (store.select('currentArticle').get() !== '2015_03_01_True-isomorphic-apps-with-React-and-Baobab.md') { document.body.scrollTop = 0; }
    store.set('currentArticle', '2015_03_01_True-isomorphic-apps-with-React-and-Baobab.md');
    store.set('currentRoute', '/articles/2015_03_01_True-isomorphic-apps-with-React-and-Baobab');
    store.set('loadingArticle', null);
    store.commit();
    render();
  });
});
Page('/articles/2015_02_22_The-great-Angular-component-experiment', function (req) {
  document.body.classList.add('article-loading');
  store.set('loadingArticle', '/articles/2015_02_22_The-great-Angular-component-experiment');
  store.commit();
  require.ensure(['./../posts/2015_02_22_The-great-Angular-component-experiment.md'], function () {
    document.body.classList.remove('article-loading');
    var content = require('./../posts/2015_02_22_The-great-Angular-component-experiment.md');
    store.select('articles', {file: '2015_02_22_The-great-Angular-component-experiment.md'}).edit(parseArticle('2015_02_22_The-great-Angular-component-experiment.md', content));
    if (store.select('currentArticle').get() !== '2015_02_22_The-great-Angular-component-experiment.md') { document.body.scrollTop = 0; }
    store.set('currentArticle', '2015_02_22_The-great-Angular-component-experiment.md');
    store.set('currentRoute', '/articles/2015_02_22_The-great-Angular-component-experiment');
    store.set('loadingArticle', null);
    store.commit();
    render();
  });
});
Page('/articles/2015_02_06_Plant-a-Baobab-tree-in-your-flux-application', function (req) {
  document.body.classList.add('article-loading');
  store.set('loadingArticle', '/articles/2015_02_06_Plant-a-Baobab-tree-in-your-flux-application');
  store.commit();
  require.ensure(['./../posts/2015_02_06_Plant-a-Baobab-tree-in-your-flux-application.md'], function () {
    document.body.classList.remove('article-loading');
    var content = require('./../posts/2015_02_06_Plant-a-Baobab-tree-in-your-flux-application.md');
    store.select('articles', {file: '2015_02_06_Plant-a-Baobab-tree-in-your-flux-application.md'}).edit(parseArticle('2015_02_06_Plant-a-Baobab-tree-in-your-flux-application.md', content));
    if (store.select('currentArticle').get() !== '2015_02_06_Plant-a-Baobab-tree-in-your-flux-application.md') { document.body.scrollTop = 0; }
    store.set('currentArticle', '2015_02_06_Plant-a-Baobab-tree-in-your-flux-application.md');
    store.set('currentRoute', '/articles/2015_02_06_Plant-a-Baobab-tree-in-your-flux-application');
    store.set('loadingArticle', null);
    store.commit();
    render();
  });
});
Page('/articles/2015_01_01_Think-twice-about-ES6-classes', function (req) {
  document.body.classList.add('article-loading');
  store.set('loadingArticle', '/articles/2015_01_01_Think-twice-about-ES6-classes');
  store.commit();
  require.ensure(['./../posts/2015_01_01_Think-twice-about-ES6-classes.md'], function () {
    document.body.classList.remove('article-loading');
    var content = require('./../posts/2015_01_01_Think-twice-about-ES6-classes.md');
    store.select('articles', {file: '2015_01_01_Think-twice-about-ES6-classes.md'}).edit(parseArticle('2015_01_01_Think-twice-about-ES6-classes.md', content));
    if (store.select('currentArticle').get() !== '2015_01_01_Think-twice-about-ES6-classes.md') { document.body.scrollTop = 0; }
    store.set('currentArticle', '2015_01_01_Think-twice-about-ES6-classes.md');
    store.set('currentRoute', '/articles/2015_01_01_Think-twice-about-ES6-classes');
    store.set('loadingArticle', null);
    store.commit();
    render();
  });
});
Page('/articles/2014_12_13_Webpack-and-react-is-awesome', function (req) {
  document.body.classList.add('article-loading');
  store.set('loadingArticle', '/articles/2014_12_13_Webpack-and-react-is-awesome');
  store.commit();
  require.ensure(['./../posts/2014_12_13_Webpack-and-react-is-awesome.md'], function () {
    document.body.classList.remove('article-loading');
    var content = require('./../posts/2014_12_13_Webpack-and-react-is-awesome.md');
    store.select('articles', {file: '2014_12_13_Webpack-and-react-is-awesome.md'}).edit(parseArticle('2014_12_13_Webpack-and-react-is-awesome.md', content));
    if (store.select('currentArticle').get() !== '2014_12_13_Webpack-and-react-is-awesome.md') { document.body.scrollTop = 0; }
    store.set('currentArticle', '2014_12_13_Webpack-and-react-is-awesome.md');
    store.set('currentRoute', '/articles/2014_12_13_Webpack-and-react-is-awesome');
    store.set('loadingArticle', null);
    store.commit();
    render();
  });
});
Page('/articles/2014_10_30_A-browserify-workflow-part-2', function (req) {
  document.body.classList.add('article-loading');
  store.set('loadingArticle', '/articles/2014_10_30_A-browserify-workflow-part-2');
  store.commit();
  require.ensure(['./../posts/2014_10_30_A-browserify-workflow-part-2.md'], function () {
    document.body.classList.remove('article-loading');
    var content = require('./../posts/2014_10_30_A-browserify-workflow-part-2.md');
    store.select('articles', {file: '2014_10_30_A-browserify-workflow-part-2.md'}).edit(parseArticle('2014_10_30_A-browserify-workflow-part-2.md', content));
    if (store.select('currentArticle').get() !== '2014_10_30_A-browserify-workflow-part-2.md') { document.body.scrollTop = 0; }
    store.set('currentArticle', '2014_10_30_A-browserify-workflow-part-2.md');
    store.set('currentRoute', '/articles/2014_10_30_A-browserify-workflow-part-2');
    store.set('loadingArticle', null);
    store.commit();
    render();
  });
});
Page('/articles/2014_10_22_Nailing-that-validation-with-React-JS', function (req) {
  document.body.classList.add('article-loading');
  store.set('loadingArticle', '/articles/2014_10_22_Nailing-that-validation-with-React-JS');
  store.commit();
  require.ensure(['./../posts/2014_10_22_Nailing-that-validation-with-React-JS.md'], function () {
    document.body.classList.remove('article-loading');
    var content = require('./../posts/2014_10_22_Nailing-that-validation-with-React-JS.md');
    store.select('articles', {file: '2014_10_22_Nailing-that-validation-with-React-JS.md'}).edit(parseArticle('2014_10_22_Nailing-that-validation-with-React-JS.md', content));
    if (store.select('currentArticle').get() !== '2014_10_22_Nailing-that-validation-with-React-JS.md') { document.body.scrollTop = 0; }
    store.set('currentArticle', '2014_10_22_Nailing-that-validation-with-React-JS.md');
    store.set('currentRoute', '/articles/2014_10_22_Nailing-that-validation-with-React-JS');
    store.set('loadingArticle', null);
    store.commit();
    render();
  });
});
Page('/articles/2014_08_29_Choosing-the-correct-packaging-tool-for-React-js', function (req) {
  document.body.classList.add('article-loading');
  store.set('loadingArticle', '/articles/2014_08_29_Choosing-the-correct-packaging-tool-for-React-js');
  store.commit();
  require.ensure(['./../posts/2014_08_29_Choosing-the-correct-packaging-tool-for-React-js.md'], function () {
    document.body.classList.remove('article-loading');
    var content = require('./../posts/2014_08_29_Choosing-the-correct-packaging-tool-for-React-js.md');
    store.select('articles', {file: '2014_08_29_Choosing-the-correct-packaging-tool-for-React-js.md'}).edit(parseArticle('2014_08_29_Choosing-the-correct-packaging-tool-for-React-js.md', content));
    if (store.select('currentArticle').get() !== '2014_08_29_Choosing-the-correct-packaging-tool-for-React-js.md') { document.body.scrollTop = 0; }
    store.set('currentArticle', '2014_08_29_Choosing-the-correct-packaging-tool-for-React-js.md');
    store.set('currentRoute', '/articles/2014_08_29_Choosing-the-correct-packaging-tool-for-React-js');
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
    module.hot.accept(["./../posts/2015_04_19_The-ultimate-webpack-setup.md","./../posts/2015_04_01_Functional-Reactive-Applications.md","./../posts/2015_03_01_True-isomorphic-apps-with-React-and-Baobab.md","./../posts/2015_02_22_The-great-Angular-component-experiment.md","./../posts/2015_02_06_Plant-a-Baobab-tree-in-your-flux-application.md","./../posts/2015_01_01_Think-twice-about-ES6-classes.md","./../posts/2014_12_13_Webpack-and-react-is-awesome.md","./../posts/2014_10_30_A-browserify-workflow-part-2.md","./../posts/2014_10_22_Nailing-that-validation-with-React-JS.md","./../posts/2014_08_29_Choosing-the-correct-packaging-tool-for-React-js.md","./../posts/2014_08_20_React-js-and-flux.md"], function () {
      Page(location.pathname);
    });
}
