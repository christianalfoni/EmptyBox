var React = require('react');
var Article = require('./../common/ArticleComponent.jsx');
var FreezerMixin = require('./../common/FreezerMixin.js');

var Front = React.createClass({
  mixins: [FreezerMixin],
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
        <a href={'/articles/' + article}>article</a>
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
  mixins: [FreezerMixin],
  contextTypes: {
    articles: React.PropTypes.object.isRequired
  },
  getContextState: function () {
    return {
      article: ['articles', 'current']
    };
  },
  render: function () {
    return (
      <div>
        <h1><a href="/">Tha blog!</a></h1>
        {this.state.article ? <Article content={this.state.article}/> : <Front/>}
      </div>
    );
  }
});

module.exports = Blog;
