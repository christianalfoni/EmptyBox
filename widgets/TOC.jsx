var React = require('react');

var TOC = React.createClass({
  renderHeader: function (header, index) {
    return (
      <ul key={header.id}>
        <li><a href={'#' + header.id}>{header.title}</a></li>
        {header.children.length ? <li>{header.children.map(this.renderHeader)}</li> : null}
      </ul>
    );
  },
  renderTOC: function (toc, header) {
    return toc.children.map(this.renderHeader);
  },
  render: function () {
    return (
      <div className="emptybox-TOC">
        <h4>Table Of Contents</h4>
        {this.props.data.map(this.renderTOC)}
      </div>
    );
  }
})
module.exports = TOC;
