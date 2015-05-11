var React = require('react');

var TwitterShare = React.createClass({
  render: function () {
    return (
      <a className="emptybox-rss"
        href={this.props.url}
        target="new">
        RSS
      </a>
    );
  }
});

module.exports = TwitterShare;

