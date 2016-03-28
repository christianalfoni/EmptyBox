var React = require('react');

var RSS = React.createClass({
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

module.exports = RSS;
