var React = require('react');
var Article = require('./Article.jsx');
var markdownRenderer = require('./../common/markdownRenderer.js');
var store = require('./../common/store.js');
var Timer = require('./Timer.jsx');

var Front = React.createClass({
  mixins: [store.mixin],
  cursors: {
    articles: ['articles']
  },
  renderArticle: function (article, index) {
    return (
      <li key={index}>
        <div>{new Date(article.published).toString()}</div>
        <div><a href={article.url}>{article.title}</a></div>
        {markdownRenderer(article.description)}
      </li>
    );
  },
  render: function () {
    var articles = this.state.cursors.articles;
    return (
      <ul className="articlesList">
        {articles.map(this.renderArticle)}
      </ul>
    );
  }
});

var Blog = React.createClass({
  mixins: [store.mixin],
  cursors: {
    article: ['currentArticle'],
    currentRoute: ['currentRoute']
  },
  renderArticle: function (article) {

    return [
      <Article key={0} article={article}/>,
      <Timer key={1}/>
    ];
  },
  getHeaderClassName: function () {
    if (this.state.cursors.currentRoute === '/') {
      return 'header-front';
    } else {
      return 'header-article';
    }
  },
  render: function () {
    var article = this.state.cursors.article;
    var headerClassName = this.getHeaderClassName();

    return (
      <div>
        <header className={'layout-header ' + headerClassName}>
          <a className="header-link" href="/">{'<- Back'}</a>
        </header>
        {article ? this.renderArticle(article) : <Front/>}
      </div>
    );
  }
});

module.exports = Blog;
