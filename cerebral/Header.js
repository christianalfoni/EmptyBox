var React = require('react');

var WrapperStyle = {
  borderBottom: '2px solid rgb(232,232,232)',
  textAlign: 'center',
  padding: '0 20px'
};

var HeaderStyle = {
  position: 'relative',
  padding: '0 10px 5px 10px',
  top: 2,
  margin: '0 auto',
  borderBottom: '2px solid rgb(183,183,183)',
  display: 'inline-block'
};

var Header = React.createClass({
  render: function () {
    return (
      <div style={WrapperStyle}>
        <h4 style={HeaderStyle}>{this.props.children}</h4>
      </div>
    );
  }
});

module.exports = Header;
