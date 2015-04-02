var React = require('react');
var markdownRenderer = require('./../common/markdownRenderer.js');
var utils = require('./utils.js');
var Disqus = require('./../widgets/Disqus.jsx');
var ga = require('react-google-analytics');

module.exports = React.createClass({
  componentDidMount: function () {
    ga('send', 'pageview', {
      page: this.props.article.url,
      title: this.props.article.title
    });
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
              {utils.getMonth(this.props.article.month)}
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
        <Disqus
          shortname={'christianalfoni'}
          identifier={this.props.article.file}
          title={this.props.article.title}
          url={'http://www.christianalfoni.com' + this.props.article.url}
        />
      </div>
    );
  }
});
