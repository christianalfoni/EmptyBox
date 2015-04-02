var Baobab = require('baobab');

var store = new Baobab(global.BLOG_STATE || {}, {
  shiftReferences: true
});

module.exports = store;
