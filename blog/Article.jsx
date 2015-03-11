var React = require('react');
var markdownRenderer = require('./../common/markdownRenderer.js');

var months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

var getMonth = function (index) {
  return months[index - 1];
};

module.exports = React.createClass({
  componentDidMount: function () {
    setTimeout(function () {
      document.body.className = document.body.className + ' article-loaded';
    }, 100);
  },
  componentWillUnmount: function () {
    document.body.className = document.body.className.replace(' article-loaded', '');  
  },
  render: function () {

    return (
      <div className="layout-article">
        <div className="layout-articleHeader">
          <div className="articleHeader-profile--container">
            <div className="articleHeader-profile--image"></div>
          </div>
          <div className="articleHeader-date--container">
            <div className="articleHeader-date--month">
              {getMonth(this.props.article.month)}
            </div>
            <div className="articleHeader-date--year">
              {this.props.article.year}
            </div>
          </div>
        </div>
        <hr className="layout-article--divider"/>
        <article>
          {markdownRenderer(this.props.article.content)}
        </article>
      </div>
    );
  }
});
