var React = require('react');
var Article = require('./../common/ArticleComponent.jsx');
var FreezerMixin = require('./../common/FreezerMixin.js');

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
        {this.state.article ? <Article content={this.state.article}/> : null}
      </div>
    );
  }
});

module.exports = Blog;
