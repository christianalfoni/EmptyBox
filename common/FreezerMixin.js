var React = require('react/addons');
var isBrowser = !(global && Object.prototype.toString.call(global.process) === '[object process]');

var FreezerMixin = {
  mixins: [React.addons.PureRenderMixin],
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
    var createSubscription = function (key, valueKey) {
      return function (value) {
        var state = {};
        state[key] = valueKey ? value[valueKey] : value;
        component.setState(state);
      };
    };

    Object.keys(contextState).forEach(function (contextKey) {

      var state = {};

      // Go through path defined, but stop at closest oject/array to set
      // listener
      var callback = null;
      var path = contextState[contextKey];
      var contextPath = path.reduce(function (path, pathKey, index) {
        if (Array.isArray(path[pathKey]) || (typeof path[pathKey] === 'object' && path[pathKey] !== null)) {

          if (isBrowser && index === path.length - 1) {
            callback = createSubscription(contextKey);
            path.getListener().on('update', callback);
          }
          return path[pathKey];

        } else {

          if (isBrowser) {
            callback = createSubscription(contextKey, pathKey);
            path.getListener().on('update', callback);
          }
          return path[pathKey];
        }
      }, this.context);

      this.subscriptions[contextKey] = {
        contextPath: contextPath,
        callback: callback
      };

      state[contextKey] = contextPath;
      this.setState(state);

    }, this);

  },
  componentWillUnmount: function () {
    Object.keys(this.subscriptions).forEach(function (subscription) {
      this.subscriptions[subscription].contextPath.getListener().off('update', subscription.callback);
    }, this);
  }
};
module.exports = FreezerMixin;
