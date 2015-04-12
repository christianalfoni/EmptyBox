var React = require('react');

var TwitterShare = React.createClass({
  render: function () {
    return (
      <a className="emptybox-twitter"
        href={'https://twitter.com/share?via=' + this.props.user}
        target="new">
        tweet
      </a>
    );
  }
});

module.exports = TwitterShare;

