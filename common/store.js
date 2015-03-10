var PureRenderMixin = require('react/lib/ReactComponentWithPureRenderMixin.js');
var Baobab = require('baobab');

var store = new Baobab(global.BLOG_STATE || {}, {
  shiftReferences: true,
  mixins: [PureRenderMixin]
});

module.exports = store;
