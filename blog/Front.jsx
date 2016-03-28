var React = require('react');
var utils = require('./utils.js');
var store = require('./../common/store.js');
var markdownRenderer = require('./../common/markdownRenderer.js');

var Front = React.createClass({
  mixins: [store.mixin],
  cursors: {
    articles: ['articles'],
    loadingArticle: ['loadingArticle']
  },
  renderArticle: function (article) {
    var isLoadingArticle = article.url === this.state.cursors.loadingArticle;
    return (
      <div>
        <div className="articlesList-item--date">
          <span className="articlesList-item--month">{utils.getMonth(article.month)} {article.date}.</span>
          <span className="articlesList-item--year">{article.year}</span>
        </div>
        <div className="articlesList-item--title">
          {isLoadingArticle ? article.title : <a href={article.url}>{article.title}</a>}
        </div>
        <div className="articlesList-item--description">
          {markdownRenderer(article.description).tree}
        </div>
        <div className="clear"></div>
      </div>
    );
  },
  renderArticleItem: function (article, index) {
    return (
      <li className="articlesList-item" key={index}>
        {this.renderArticle(article)}
      </li>
    );
  },
  render: function () {
    var articles = this.state.cursors.articles.slice(0);
    var latestArticle = articles.shift();
    return (
      <div className="layout-container">
        <div className="layout-column1">
          <div className="latestArticle articlesList-item articlesList-item-first">
            {this.renderArticle(latestArticle)}
          </div>
          <ul className="articlesList">
            {articles.map(this.renderArticleItem)}
          </ul>
        </div>
        <div className="layout-column2">
          <h2 className="header-sidebar">Who is Christian Alfoni?</h2>
                      <div className="profile-picture"></div>
          <p className="text-small">
            Got into programming about 5 years ago and completely fell in love with it. The productivity
            you have working with the web platform is incredible. Going from idea to production can be
            done in a matter of hours. The momentum of new standards, new practices, ideas and solutions
            also keeps me on my toes, as there is always something new to dive into. The greatest thing about
            the web as a platform though is its open source community. Love contributing with ideas and thoughts
            on current and new developments in the world of web applications.
          </p>
          <p className="text-small">
            Currently running my own startup and doing consultancy. Please contact me on <a href="mailto:christianalfoni@gmail.com">christianalfoni@gmail.com</a> if
            you have any questions or feedback.
          </p>
          <h2 className="header-sidebar">Projects</h2>
          <h3 className="header-sidebar-small">
            <a href="https://github.com/christianalfoni/cerebral" target="new">Cerebral</a>
          </h3>
          <p className="text-small">
            An state controller with its own debugger
          </p>
          <h3 className="header-sidebar-small">
            <a href="https://github.com/christianalfoni/EmptyBox" target="new">EmptyBox</a>
          </h3>
          <p className="text-small">
            This blog is built with EmptyBox. It is an isomorphic hackable blog project based on
            React JS.
          </p>
          <h3 className="header-sidebar-small">
            <a href="http://www.instaslideshow.com" target="new">instaslideshow.com</a>
          </h3>
          <p className="text-small">
            Log in with instagram and type a hashtag to get a slideshow. Live updates and also
            supports videos.
          </p>
          <h3 className="header-sidebar-small">
            <a href="http://www.jsfridge.com" target="new">JSFridge</a>
          </h3>
          <p className="text-small">
            A "teach to code" service that will be used as a prototype for a new exciting
            project I will be working on with the Norwegian organization
            <a href="http://www.kidsakoder.no/"> "Lær kidsa koding"</a>.
          </p>
          <h3 className="header-sidebar-small">
            <a href="https://github.com/christianalfoni/react-webpack-cookbook/wiki" target="new">Webpack React Cookbook</a>
          </h3>
          <p className="text-small">
            Working on a project to explain the amazing features of Webpack and React JS.
          </p>
          <h2 className="header-sidebar">Tools</h2>
          <h3 className="header-sidebar-small">
            <a href="https://github.com/christianalfoni/formsy-react" target="new">Formsy-React</a>
          </h3>
          <p className="text-small">
            A super flexible form component and form element concept for React JS.
          </p>
          <h3 className="header-sidebar-small">
            <a href="https://github.com/christianalfoni/flux-angular" target="new">Flux-Angular</a>
          </h3>
          <p className="text-small">
            A flux implementation for Angular using Yahoo Dispatcher and my own immutable-store project.
          </p>
          <h3 className="header-sidebar-small">
            <a href="https://github.com/christianalfoni/immutable-store" target="new">Immutable-Store</a>
          </h3>
          <p className="text-small">
            A tool that lets you very easily create and use immutable data structures.
          </p>
        </div>
      </div>
    );
  }
});

module.exports = Front;
