var React = require('react');

function AppWrapper(storeState, Component) {

  var Wrapper = React.createClass({
    childContextTypes: Object.keys(storeState).reduce(function (contextTypes, key) {
      contextTypes[key] = React.PropTypes.object.isRequired
      return contextTypes;
    }, {}),
    getChildContext: function () {
      return this.props.state;
    },
    render: function () {
      return <Component/>
    }
  });

  return Wrapper;

};

module.exports = AppWrapper;
