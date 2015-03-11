var React = require('react');
var store = require('./../common/store.js');

var Timer = React.createClass({
  getInitialState: function () {
    return {
      time: '7'
    };
  },
  render: function () {
    return (
      <h1 className="timer">{this.state.time} min</h1>
    );
  }
})
module.exports = Timer;
