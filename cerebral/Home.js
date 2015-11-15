var React = require('react');
var Header = require('./Header.js');

var Home = React.createClass({
  openIntroduction: function () {
    window.open('http://www.christianalfoni.com/articles/2015_09_22_Introducing-Cerebral');
  },
  render: function () {
    return (
      <div>
        <h1 className="cerebral-header">Cerebral</h1>
        <div className="cerebral-row">
          <div className="cerebral-column">
            <h3>State</h3>
            <p className="text-small">
              Applications are stateful. The application needs to know what page to display,
              if a dropdown is opened or you are currently getting some data from the server. With
              Cerebral you define all the state of your application in one state tree. Think of it like
              a client database, but it holds all the data your applications needs, even if it is just for
              the client.
            </p>
          </div>
          <div className="cerebral-column space cerebral-logo" style={{backgroundImage: 'url(logo.png)'}}>
          </div>
          <div className="cerebral-column">
            <h3>UI</h3>
            <p className="text-small">
              The UI is produced using the application state. It is passed to a render function or exposed
              to a template. When you want your UI to change, your application state has to change. Your application
              listens to UI events and uses <i>Cerebral</i> to execute the state update. After an update is complete
              the UI will render the new state of the application.
            </p>
          </div>
        </div>
        <div className="cerebral-row">
          <div className="cerebral-column"></div>
          <div className="cerebral-column">
            <h2 className="header-subtitle center">Express your application flow with signals</h2>
          </div>
          <div className="cerebral-column"></div>
        </div>

        <div className="cerebral-row">

          <div className="cerebral-column">
            <Header>Packages</Header>
            <ul className="cerebral-list divided">
              <li><i className="icon icon-television"/> React</li>
              <li><i className="icon icon-television"/> Angular</li>
            </ul>
            <ul className="cerebral-list divided">
              <li><i className="icon icon-database"/> Baobab</li>
              <li><i className="icon icon-database"/> Tcomb</li>
            </ul>
          </div>

          <div className="cerebral-column">
            <Header>Debugger</Header>
            <div className="clip" onClick={this.props.openVideo.bind(null, 'https://www.youtube.com/embed/QhStJqngBXc')}>
              <i className="icon icon-play-circle-o"/>
            </div>
          </div>

          <div className="cerebral-column">
            <Header>Introductions</Header>
            <ul className="cerebral-list">
            <li>
              <i
                className="icon icon-play-circle-o link"
                onClick={this.props.openVideo.bind(null, 'https://youtu.be/BfzjuhX4wJ0?t=5h44m34s')}> ReactiveConf2015 Talk - <small>30:00</small></i>
            </li>
            <li>
              <i
                className="icon icon-file-text link"
                onClick={this.openIntroduction}> Introduction article</i>
            </li>
              <li>
                <i
                  className="icon icon-play-circle-o link"
                  onClick={this.props.openVideo.bind(null, 'https://www.youtube.com/embed/O_fk8jBtKSU')}> Introduction - <small>30:37</small></i>
              </li>
              <li>
                <i
                  className="icon icon-play-circle-o link"
                  onClick={this.props.openVideo.bind(null, 'https://www.youtube.com/embed/cFB5V86Kz20')}> Get started - <small>31:15</small></i>
              </li>
              <li>
                <i
                  className="icon icon-play-circle-o link"
                  onClick={this.props.openVideo.bind(null, 'https://www.youtube.com/embed/PZjXPziD9Cw')}> Routing - <small>15:20</small></i>
              </li>
            </ul>
          </div>
        </div>

      </div>
    );
  }
});

module.exports = Home;
