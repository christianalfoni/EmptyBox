var React = require('react');
var markdownRenderer = require('./../common/markdownRenderer.js');
var menu = require('./menu.js');
var Addressbar = require('react-addressbar');
var urlMapper = require('url-mapper');
var baseUrl = location.pathname === '/' ? '' : location.pathname;

module.exports = React.createClass({
  getInitialState: function () {
    return {
      url: location.href + (location.hash === '' ? '#/0' : ''),
      content: menu[0].content,
      itemIndex: 0,
      subitemIndex: null,
      currentSubPage: null,
      displayMenu: true,
      showOverlay: false,
      videoSrc: null,
      transitionVideo: false
    };
  },
  toggleMenu: function () {
    this.setState({
      displayMenu: !this.state.displayMenu
    });
  },
  openGithub: function () {
    window.open("http://www.github.com/christianalfoni/cerebral");
  },
  openVideo: function (src) {
    this.setState({
      showOverlay: true,
      videoSrc: src
    });
    setTimeout(function () {
      this.setState({
        transitionVideo: true
      })
    }.bind(this), 50);
  },
  closeVideo: function () {
    this.setState({
      showOverlay: false,
      videoSrc: null,
      transitionVideo: false
    });
  },
  setContent: function (content, itemIndex, subitemIndex) {
    this.setState({
      url: location.origin + baseUrl + '/#/' + itemIndex + (typeof subitemIndex === 'number' ? '/' + subitemIndex : ''),
      content: typeof content === 'string' ? markdownRenderer(content).tree : content,
      itemIndex: itemIndex,
      subitemIndex: typeof subitemIndex === 'number' ? subitemIndex : null
    });
    if (this.refs.content) this.refs.content.getDOMNode().scrollTop = 0;
  },
  setContentByRoute: function (route) {
    var itemIndex = Number(route.params.item);

    if (route.params.subitem) {
      var subitemIndex = Number(route.params.subitem);
      this.setContent(menu[itemIndex + 1][subitemIndex].content, itemIndex, subitemIndex);
    } else {
      this.setContent(menu[itemIndex].content, itemIndex);
    }

  },
  createTweet: function () {
    window.open('https://twitter.com/share');
  },
  openChat: function () {
    window.open('https://gitter.im/christianalfoni/cerebral');
  },
  onUrlChange: function (url) {
    if (this.state.url !== url) {
      this.mapUrl(url);
    }
  },
  mapUrl: function (url) {
    urlMapper(url, {
      '/:item': this.setContentByRoute,
      '/:item/:subitem': this.setContentByRoute
    });
  },
  componentWillMount: function () {
    this.mapUrl(this.state.url);
  },
  renderPage: function () {
    var pageStyle = {
      transform: 'translate3d(' + (this.state.displayMenu ? '200px' : '0') + ', 0, 0)',
      WebkitTransform: 'translate3d(' + (this.state.displayMenu ? '200px' : '0') + ', 0, 0)'
    };
    var headerStyle = {
      paddingRight: this.state.displayMenu ? 200 : 0
    };
    var contentStyle = {
      paddingRight: this.state.displayMenu ? 240 : 40
    };
    var content = typeof this.state.content === 'function' ? <this.state.content openVideo={this.openVideo}/> : this.state.content;

    return (
      <div className="page" style={pageStyle}>
        <div className="header" style={headerStyle}>
          <i className="icon icon-bars link" onClick={this.toggleMenu} style={{margin: 10}}></i>
          <div className="github" onClick={this.openGithub}>
            <i className="icon icon-github-square"> Github Project</i>
          </div>
          <div className="tweet" onClick={this.createTweet}>
            <i className="icon icon-twitter"> Tweet about Cerebral</i>
          </div>
          <div className="tweet" onClick={this.openChat}>
            <i className="icon icon-comments"> Talk to us on Gitter</i>
          </div>
        </div>
        <div ref="content" className="content" style={contentStyle}>
          <div className="content-wrapper">
            {content}
          </div>
        </div>
      </div>
    );
  },
  renderMenu: function () {

    var lastItemIndex = null;
    return (
      <ul className="menu">
        {menu.map(function (item, itemIndex) {
          if (Array.isArray(item)) {
            return (
              <li key={itemIndex}>
                <ul className="submenu">
                  {item.map(function (subitem, subitemIndex) {
                    return (
                      <li
                        key={subitemIndex}
                        onClick={this.setContent.bind(null, subitem.content, lastItemIndex, subitemIndex)}
                        className={this.state.itemIndex === lastItemIndex && this.state.subitemIndex === subitemIndex ? 'active' : null}>
                        <i className={'icon icon-' + subitem.icon}/> {subitem.label}
                      </li>
                    )
                  }, this)}
                </ul>
              </li>
            );
          } else {
            lastItemIndex = itemIndex;
            return (
              <li
                key={itemIndex}
                onClick={this.setContent.bind(null, item.content, itemIndex)}
                className={this.state.itemIndex === itemIndex ? this.state.subitemIndex !== null ? 'active head' : 'active' : null}>
                <i className={'icon icon-' + item.icon}/> {item.label}
              </li>
            );
          }

        }, this)}
      </ul>
    );
  },
  render: function () {
    var VideoWrapperStyle = {
      opacity: this.state.transitionVideo ? '0.8' : '0'
    };
    var VideoStyle = {
      opacity: this.state.transitionVideo ? '1' : '0'
    };
    return (
      <div style={{height: '100%'}}>
        <Addressbar value={this.state.url} onChange={this.onUrlChange} onlyHash/>
        {this.renderMenu()}
        {this.renderPage()}
        {
          this.state.showOverlay ?
            <div className="overlay" style={VideoWrapperStyle} onClick={this.closeVideo}></div>
          :
            null
        }
        {
          this.state.showOverlay ?
            <div className="videoframe" style={VideoStyle}>
              <iframe width="900" height="506" src={this.state.videoSrc + '?autoplay=1'} frameborder="0" allowfullscreen></iframe>
            </div>
          :
            null
        }
      </div>
    );
  }
});
