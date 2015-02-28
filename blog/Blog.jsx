var React = require('react');
var Article = require('./../common/ArticleComponent.jsx');
var Mixin = require('./../common/Mixin.js');
var markdownRenderer = require('./../common/markdownRenderer.jsx');

var Front = React.createClass({
  mixins: [Mixin],
  contextTypes: {
    articles: React.PropTypes.object.isRequired
  },
  getContextState: function () {
    return {
      articles: ['articles', 'list']
    };
  },
  renderArticle: function (article) {
    return (
      <li>
        <div>{new Date(article.published).toString()}</div>
        <div><a href={article.url}>{article.title}</a></div>
        {markdownRenderer(article.description)}
      </li>
    );
  },
  render: function () {
    return (
      <ul>
        {this.state.articles.map(this.renderArticle)}
      </ul>
    );
  }
});

var Blog = React.createClass({
  mixins: [Mixin],
  getContextState: function () {
    return {
      article: ['articles', 'current']
    };
  },
  render: function () {
    console.log('Rendering!');
    return (
      <div>
        <h1><a href="/">Tha blog!</a></h1>
        {this.state.article ? <Article content={this.state.article.content}/> : <Front/>}
      </div>
    );
  }
});

module.exports = Blog;
