require('./../styles/base.css');
require('./../styles/base-layout.css');
require('./../styles/base-components.css');
require('./../styles/highlight.css');
require('./../core/_fonts.css')
require('./styles.css')

var React = require('react');
var App = require('./App.js');

React.render(<App/>, document.body);
