var React = require('react');
var markdownRenderer = require('./markdownRenderer.jsx');

module.exports = React.createClass({
  render: function () {
    return React.createElement('article', null,
      markdownRenderer(this.props.content)
    );
  }
});
