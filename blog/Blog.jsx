var React = require('react');
var Front = require('./Front.jsx');
var Article = require('./Article.jsx');
var markdownRenderer = require('./../common/markdownRenderer.js');
var store = require('./../common/store.js');
var utils = require('./utils.js');
var ga = require('react-google-analytics');
ga('create', 'UA-53419566-1', 'auto');

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
      <div className="layout-blog">
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
