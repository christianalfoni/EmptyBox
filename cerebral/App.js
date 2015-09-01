var React = require('react');
var markdownRenderer = require('./../common/markdownRenderer.js');
var codeLeft = require('./markdown/codeLeft.md');
var codeRight = require('./markdown/codeRight.md');


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
      <div style={{paddingTop: 20}}>
        <div className="cerebral-container simple-code">
          <div className="cerebral-column">
            {markdownRenderer(codeLeft).tree}
          </div>
          <div className="cerebral-column">
            <img src="logo.png"/>
          </div>
          <div className="cerebral-column">
            {markdownRenderer(codeRight).tree}
          </div>
        </div>
        <div className="cerebral-container">
          <div style={{margin: '0 auto', width: 700, textAlign: 'center'}}>
            <h3 style={{marginTop: 0, color: '#333'}}>Express your application flow with signals</h3>
          </div>
        </div>
        <div style={{backgroundColor: '#5CB85C'}}>
          <div className="cerebral-container">
            <div className="cerebral-column">
              <h3 className="cerebral-header white">Supports</h3>
            </div>
            <div className="cerebral-column">
              <h3 className="cerebral-header white">Debugger</h3>
            </div>
            <div className="cerebral-column">
              <h3 className="cerebral-header white">Introductions</h3>
            </div>
          </div>
        </div>
      </div>
    );
  }
});
