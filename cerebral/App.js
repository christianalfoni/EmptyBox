var React = require('react');
var markdownRenderer = require('./../common/markdownRenderer.js');
var introduction = require('./markdown/introduction.md');
var modelLayer = require('./markdown/modelLayer.md');
var cerebral = require('./markdown/cerebral.md');
var immutableStore = require('./markdown/immutablestore.md');


module.exports = React.createClass({
  getInitialState: function () {
    return {
      viewLayerTabIndex: 0,
      modelLayerTabIndex: 0
    };
  },
  render: function () {
    return (
      <div className="cerebral-container">
        <div className="cerebral-header">
          <h1>Cerebral</h1>
          <h4>The state controller with its own debugger</h4>
        </div>
        <div className="cerebral-showcase">
          <div className="cerebral-showcase-red">
            <h1>M</h1>
            <div>Immutable-Store, Baobab, Tcomb</div>
          </div>
          <div className="cerebral-showcase-green">
            <h1>V</h1>
            <div>React, Angular</div>
          </div>
          <div className="cerebral-showcase-yellow">
            <h1>C</h1>
            <div>Cerebral</div>
          </div>
        </div>
        <div className="cerebral-columns">

          <div>
          {markdownRenderer(introduction).tree}
          </div>

          <div style={{textAlign: 'center',paddingTop: 50}}>
            <iframe width="420" height="315" src="https://www.youtube.com/embed/rHqIunT5qus" frameBorder="0" allowFullscreen></iframe>
          </div>

        </div>
          {markdownRenderer(cerebral).tree}
          {markdownRenderer(modelLayer).tree}
          <div>

            <ul className="nav nav-tabs" role="tablist">
              <li role="presentation" className="active"><a href="#home" aria-controls="home" role="tab" data-toggle="tab">Immutable-Store</a></li>
              <li role="presentation"><a href="#profile" aria-controls="profile" role="tab" data-toggle="tab">Baobab</a></li>
              <li role="presentation"><a href="#profile" aria-controls="profile" role="tab" data-toggle="tab">Tcomb</a></li>
              <li role="presentation">Immutable-JS (Coming soon)</li>
            </ul>

            <div className="tab-content">
              <div role="tabpanel" className="tab-pane active" id="home">
                {markdownRenderer(immutableStore).tree}
              </div>
              <div role="tabpanel" className="tab-pane" id="profile">...</div>
              <div role="tabpanel" className="tab-pane" id="messages">...</div>
              <div role="tabpanel" className="tab-pane" id="settings">...</div>
            </div>

        </div>
      </div>
    );
  }
});
