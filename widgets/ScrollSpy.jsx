var React = require('react');

var ScrollSpy = React.createClass({
  getInitialState: function () {
    return {
      className: 'emptybox-scrollspy'
    };
  },
  componentDidMount: function () {
    window.addEventListener('scroll', this.spy);
  },
  componentWillUnmount: function () {
    window.removeEventListener('scroll', this.spy);
  },
  spy: function (event) {
    if (this.state.className === 'emptybox-scrollspy' && document.body.scrollTop >= this.props.active) {
      this.setState({
        className: 'emptybox-scrollspy-active'
      });
    } else if (this.state.className === 'emptybox-scrollspy-active' && document.body.scrollTop < this.props.active) {
      this.setState({
        className: 'emptybox-scrollspy'
      });
    }
  },
  render: function () {
    return (
      <div className={this.state.className}>
        {this.props.children}
      </div>
    );
  }
})
module.exports = ScrollSpy;
