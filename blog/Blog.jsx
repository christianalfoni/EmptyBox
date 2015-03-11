var React = require('react');
var Article = require('./Article.jsx');
var markdownRenderer = require('./../common/markdownRenderer.js');
var store = require('./../common/store.js');
var Timer = require('./Timer.jsx');
var utils = require('./utils.js');

var Front = React.createClass({
  mixins: [store.mixin],
  cursors: {
    articles: ['articles']
  },
  renderArticle: function (article, index) {
    return (
      <li className={'articlesList-item' + (index === 0 ? ' articlesList-item-first' : '')} key={index}>
        <div className="articlesList-item--date">
          <span className="articlesList-item--month">{utils.getMonth(article.month)}</span> 
          <span className="articlesList-item--year">{article.year}</span>
        </div>
        <div className="articlesList-item--title"><a href={article.url}>{article.title}</a></div>
        {index === 0 ?
          <div className="articlesList-item--description">
            {markdownRenderer(article.description)}
          </div> :
          null 
        }
        <div className="clear"></div>
      </li>
    );
  },
  render: function () {
    var articles = this.state.cursors.articles;
    return (
      <ul className="articlesList">
        {articles.map(this.renderArticle)}
      </ul>
    );
  }
});

var Blog = React.createClass({
  mixins: [store.mixin],
  cursors: {
    article: ['currentArticle'],
    currentRoute: ['currentRoute']
  },
  renderArticle: function (article) {
    return [
      <Article key={0} article={article}/>,
      <Timer key={1}/>
    ];
  },
  render: function () {
    var article = this.state.cursors.article;
    return (
      <div>
        <header className="layout-header">
          {article ? <a className="header-link" href="/">{'<- Back'}</a> : null}
          {!article ? <h1 className="header-title">christianalfoni</h1> : null}
        </header>
        {article ? this.renderArticle(article) : <Front/>}
      </div>
    );
  }
});

module.exports = Blog;
