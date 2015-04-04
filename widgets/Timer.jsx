var React = require('react');

var Timer = React.createClass({
  height: 0,
  charactersPrMinute: 2200,
  delay: null,
  componentWillUnmount: function () {
    window.removeEventListener('scroll', this.timeLeft);
  },
  getInitialState: function () {
    return {
      time: 0
    };
  },
  calculateTime: function () {
    var total = parseInt(this.props.content.length / this.charactersPrMinute);
    var prPixel = total / this.height;
    var scrolled = prPixel * document.body.scrollTop;
    return total - Math.floor(scrolled);
  },
  componentDidMount: function () {
    window.addEventListener('scroll', this.timeLeft);
    this.height = document.body.scrollHeight;
    this.setState({
      time: this.calculateTime()
    })
  },
  timeLeft: function () {
    if (!this.delay) {
      this.delay = setTimeout(function () {
        this.setState({
          time: this.calculateTime()
        });
        this.delay = null;
      }.bind(this), 100);
    } 
  },
  render: function () {
    return (
      <h1 className="emptybox-timer">
        <div>{this.state.time}</div> 
        min
      </h1>
    );
  }
})
module.exports = Timer;
