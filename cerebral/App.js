var React = require('react');
var markdownRenderer = require('./../common/markdownRenderer.js');
var introduction = require('./markdown/introduction.md');
var modelLayer = require('./markdown/modelLayer.md');
var viewLayer = require('./markdown/viewLayer.md');
var cerebral = require('./markdown/cerebral.md');
var immutableStore = require('./markdown/immutablestore.md');
var baobab = require('./markdown/baobab.md');
var tcomb = require('./markdown/tcomb.md');
var react = require('./markdown/react.md');
var angular = require('./markdown/angular.md');
var signals = require('./markdown/signals.md');
var end = require('./markdown/end.md');


module.exports = React.createClass({
  getInitialState: function () {
    return {
      viewLayerTabIndex: 0,
      modelLayerTabIndex: 0
    };
  },
  selectModelLayer: function (index, event) {
    event.preventDefault();
    this.setState({
      modelLayerTabIndex: index
    });
  },
  selectViewLayer: function (index, event) {
    event.preventDefault();
    this.setState({
      viewLayerTabIndex: index
    });
  },
  render: function () {
    var linkFontStyle = {
      fontSize: 20,
      lineHeight: '40px'
    };
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


        <div>
          {markdownRenderer(introduction).tree}

          <div style={{textAlign: 'center',paddingTop: 50}}>
            <iframe width="420" height="315" src="https://www.youtube.com/embed/O_fk8jBtKSU" frameBorder="0" allowFullscreen></iframe>
            <iframe width="420" height="315" src="https://www.youtube.com/embed/cFB5V86Kz20" frameBorder="0" allowFullscreen></iframe>
            <iframe width="420" height="315" src="https://www.youtube.com/embed/PZjXPziD9Cw" frameborder="0" allowfullscreen></iframe>
          </div>
        </div>

        {markdownRenderer(cerebral).tree}
        {markdownRenderer(modelLayer).tree}
        <div>

          <ul className="nav nav-tabs" role="tablist">
            <li role="presentation" className={this.state.modelLayerTabIndex === 0 ? 'active' : ''}>
              <a href="#" aria-controls="home" role="tab" data-toggle="tab" onClick={this.selectModelLayer.bind(null, 0)}>Immutable-Store</a>
            </li>
            <li role="presentation" className={this.state.modelLayerTabIndex === 1 ? 'active' : ''}>
              <a href="#" aria-controls="home" role="tab" data-toggle="tab" onClick={this.selectModelLayer.bind(null, 1)}>Baobab</a>
            </li>
            <li role="presentation" className={this.state.modelLayerTabIndex === 2 ? 'active' : ''}>
              <a href="#" aria-controls="home" role="tab" data-toggle="tab" onClick={this.selectModelLayer.bind(null, 2)}>Tcomb</a>
            </li>
            <li role="presentation">Immutable-JS (Coming soon)</li>
          </ul>

          <div className="tab-content">
            <div role="tabpanel" className={'tab-pane' + (this.state.modelLayerTabIndex === 0 ? ' active' : '')}>
              {markdownRenderer(immutableStore).tree}
            </div>
            <div role="tabpanel" className={'tab-pane' + (this.state.modelLayerTabIndex === 1 ? ' active' : '')}>
              {markdownRenderer(baobab).tree}
            </div>
            <div role="tabpanel" className={'tab-pane' + (this.state.modelLayerTabIndex === 2 ? ' active' : '')}>
              {markdownRenderer(tcomb).tree}
            </div>
          </div>

        </div>
        {markdownRenderer(viewLayer).tree}
        <div>

          <ul className="nav nav-tabs" role="tablist">
            <li role="presentation" className={this.state.viewLayerTabIndex === 0 ? 'active' : ''}>
              <a href="#" aria-controls="home" role="tab" data-toggle="tab" onClick={this.selectViewLayer.bind(null, 0)}>React</a>
            </li>
            <li role="presentation" className={this.state.viewLayerTabIndex === 1 ? 'active' : ''}>
              <a href="#" aria-controls="home" role="tab" data-toggle="tab" onClick={this.selectViewLayer.bind(null, 1)}>Angular</a>
            </li>
          </ul>

          <div className="tab-content">
            <div role="tabpanel" className={'tab-pane' + (this.state.viewLayerTabIndex === 0 ? ' active' : '')}>
              {markdownRenderer(react).tree}
            </div>
            <div role="tabpanel" className={'tab-pane' + (this.state.viewLayerTabIndex === 1 ? ' active' : '')}>
              {markdownRenderer(angular).tree}
            </div>
          </div>

        </div>
        <h2>4. Signals</h2>
        <div>
          <a href="#naming" style={linkFontStyle}> Naming</a> ---
          <a href="#action" style={linkFontStyle}> Action</a> ---
          <a href="#arguments" style={linkFontStyle}> Arguments</a> ---
          <a href="#chain" style={linkFontStyle}> Chain</a> ---
          <a href="#trigger" style={linkFontStyle}> Trigger</a> ---
          <a href="#paths" style={linkFontStyle}> Paths</a> ---
          <a href="#async" style={linkFontStyle}> Async</a> ---
          <a href="#outputs" style={linkFontStyle}> Outputs</a> ---
          <a href="#types" style={linkFontStyle}> Types</a> ---
          <a href="#custom-types" style={linkFontStyle}> Custom Types</a> ---
          <a href="#groups" style={linkFontStyle}> Groups</a> ---
          <a href="#events" style={linkFontStyle}> Events</a> ---
          <a href="#functional-traits" style={linkFontStyle}> Functional Traits</a>
        </div>
        {markdownRenderer(signals).tree}

        <div style={{textAlign: 'center', margin: 25, borderRadius: 5, backgroundColor: '#FFF'}}>
          <div style={{display: 'inline-block'}}>
            <img src="logo.png" width="200" style={{float: 'left'}}/>
            <div style={{float: 'left', width: 500, textAlign: 'left'}}>
              {markdownRenderer(end).tree}
            </div>
            <div style={{clear: 'both'}}/>
          </div>
        </div>
      </div>
    );
  }
});
