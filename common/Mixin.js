var React = require('react/addons');
var isBrowser = !(global && Object.prototype.toString.call(global.process) === '[object process]');

var FreezerMixin = {
  mixins: [React.addons.PureRenderMixin],
  contextTypes: {
    store: React.PropTypes.object.isRequired
  },
  componentWillMount: function () {

    var contextState = {};
    if (!this.context) {
      return;
    }

    if (this.getContextState) {
      contextState = this.getContextState();
    }

    this.subscriptions = {};
    var component = this;
    var createSubscription = function (key, cursor) {
      return function (value) {
        var state = {};
        state[key] = cursor.get();
        component.setState(state);
      };
    };

    var state = {};
    Object.keys(contextState).forEach(function (contextKey) {

      if (isBrowser) {

        var cursor = this.context.store.select(contextState[contextKey]);
        var callback = createSubscription(contextKey, cursor)
        state[contextKey] = cursor.get();
        this.subscriptions[contextKey] = {
          cursor: cursor,
          callback: callback
        };
        cursor.on('update', callback);

      } else {

        var path = contextState[contextKey];
        var value = path.reduce(function (contextPath, pathKey, index) {
          return contextPath[pathKey];
        }, this.context.store);
        state[contextKey] = value;

      }

    }, this);
    this.setState(state);

  },
  componentWillUnmount: function () {
    Object.keys(this.subscriptions).forEach(function (subscription) {
      this.subscriptions[subscription].cursor.off('update', subscription.callback);
    }, this);
  }
};
module.exports = FreezerMixin;
