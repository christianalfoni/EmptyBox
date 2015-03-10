var React = require('react');
var Article = require('./../common/ArticleComponent.jsx');
var markdownRenderer = require('./../common/markdownRenderer.jsx');
var store = require('./../common/store.js');

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
      <ul>
        {articles.map(this.renderArticle)}
      </ul>
    );
  }
});

var Blog = React.createClass({
  mixins: [store.mixin],
  cursors: {
    article: ['currentArticle']
  },
  render: function () {
    var article = this.state.cursors.article;
    return (
      <div>
        <h1><a href="/">Tha blog!</a></h1>
        {article ? <Article content={article.content}/> : <Front/>}
      </div>
    );
  }
});

module.exports = Blog;
