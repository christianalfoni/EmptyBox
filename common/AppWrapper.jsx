var React = require('react');

function AppWrapper(storeState, Component) {

  var Wrapper = React.createClass({
    childContextTypes: {
      store: React.PropTypes.object.isRequired
    },
    getChildContext: function () {
      return {
        store: this.props.store
      };
    },
    render: function () {
      return <Component/>
    }
  });

  return Wrapper;

};

module.exports = AppWrapper;
