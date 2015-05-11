var React = require('react');
var markdownRenderer = require('./../common/markdownRenderer.js');
var utils = require('./utils.js');
var Disqus = require('./../widgets/Disqus.jsx');
var TOC = require('./../widgets/TOC.jsx');
var ScrollSpy = require('./../widgets/ScrollSpy.jsx');
var TwitterShare = require('./../widgets/TwitterShare.jsx');
var Timer = require('./../widgets/Timer.jsx');
var Rss = require('./../widgets/Rss.jsx');
var ga = require('react-google-analytics');

module.exports = React.createClass({
  componentDidMount: function () {
    ga('send', 'pageview', {
      page: this.props.article.url,
      title: this.props.article.title
    });
  },
  render: function () {
    var renderedArticle = markdownRenderer(this.props.article.content);
    return (
      <div className="layout-container">
        <div className="layout-column3">
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
              {renderedArticle.tree}
            </article>
            <Disqus
              shortname={'christianalfoni'}
              identifier={this.props.article.file}
              title={this.props.article.title}
              url={'http://www.christianalfoni.com' + this.props.article.url}/>
          </div>
        </div>
        <div className="layout-column4">
          <ScrollSpy active={230}>
            <Timer content={this.props.article.content}/>
            <TwitterShare 
              url={'http://www.christianalfoni.com' + this.props.article.url} 
              user="christianalfoni"/>
            <Rss url="http://www.christianalfoni.com/rss"/>
            <TOC data={renderedArticle.toc}/>
          </ScrollSpy>
        </div>
      </div>
    );
  }
});
