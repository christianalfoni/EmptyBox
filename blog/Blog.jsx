var React = require('react');
var Article = require('./Article.jsx');
var markdownRenderer = require('./../common/markdownRenderer.js');
var store = require('./../common/store.js');
var utils = require('./utils.js');
var ga = require('react-google-analytics');
ga('create', 'UA-53419566-1', 'auto');

var Front = React.createClass({
  mixins: [store.mixin],
  cursors: {
    articles: ['articles'],
    loadingArticle: ['loadingArticle']
  },
  renderArticle: function (article) {
    var isLoadingArticle = article.url === this.state.cursors.loadingArticle;
    return (
      <div>
        <div className="articlesList-item--date">
          <span className="articlesList-item--month">{utils.getMonth(article.month)} {article.date}.</span> 
          <span className="articlesList-item--year">{article.year}</span>
        </div>
        <div className="articlesList-item--title">
          {isLoadingArticle ? article.title : <a href={article.url}>{article.title}</a>}
        </div>
        <div className="articlesList-item--description">
          {markdownRenderer(article.description).tree}
        </div>
        <div className="clear"></div>
      </div>
    );
  },
  renderArticleItem: function (article, index) {
    return (
      <li className="articlesList-item" key={index}>
        {this.renderArticle(article)}
      </li>
    );
  },
  render: function () {
    var articles = this.state.cursors.articles.slice(0);
    var latestArticle = articles.shift();
    return (
      <div>
        <div className="latestArticle articlesList-item articlesList-item-first">
          {this.renderArticle(latestArticle)}
        </div>
        <ul className="articlesList">
          {articles.map(this.renderArticleItem)}
        </ul>
      </div>
    );
  }
});

var Blog = React.createClass({
  mixins: [store.mixin],
  cursors: {
    articles: ['articles'],
    currentArticle: ['currentArticle'],
    currentRoute: ['currentRoute']
  },
  renderArticle: function (article) {
    return <Article article={article}/>
  },
  renderHeader: function () {
    return (
      <div className="header-title">
        <h1 className="header-title--maintitle"><a href="/">christianalfoni</a></h1>
        <h4 className="header-title--subtitle">
          Built with <a href="https://github.com/christianalfoni/EmptyBox" target="new"> EmptyBox</a>
        </h4>
      </div>
    );
  },
  render: function () {
    var article = this.state.cursors.articles.filter(function (article) {
      return article.file === this.state.cursors.currentArticle; 
    }, this).pop();
    return (
      <div>
        <header className="layout-header">
          {this.renderHeader()}
        </header>
        {article && article.content ? this.renderArticle(article) : <Front/>}
        <ga.Initializer/>
      </div>
    );
  }
});

module.exports = Blog;
