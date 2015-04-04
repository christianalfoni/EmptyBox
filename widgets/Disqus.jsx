var React = require('react');
var DISQUS_CONFIG = [
  'shortname', 'identifier', 'title', 'url', 'category_id'
];

// Convert underscore to camelCase
function camelCase(str) {
  return str.replace(/(_.{1})/g, function (match) {
    return match[1].toUpperCase();
  });
}

module.exports = React.createClass({
  displayName: 'DisqusThread',

  propTypes: {
    /**
     * `shortname` tells the Disqus service your forum's shortname,
     * which is the unique identifier for your website as registered
     * on Disqus. If undefined , the Disqus embed will not load.
     */
    shortname: React.PropTypes.string.isRequired,

    /**
     * `identifier` tells the Disqus service how to identify the
     * current page. When the Disqus embed is loaded, the identifier
     * is used to look up the correct thread. If disqus_identifier
     * is undefined, the page's URL will be used. The URL can be
     * unreliable, such as when renaming an article slug or changing
     * domains, so we recommend using your own unique way of
     * identifying a thread.
     */
    identifier: React.PropTypes.string,

    /**
     * `title` tells the Disqus service the title of the current page.
     * This is used when creating the thread on Disqus for the first time.
     * If undefined, Disqus will use the <title> attribute of the page.
     * If that attribute could not be used, Disqus will use the URL of the page.
     */
    title: React.PropTypes.string,

    /**
     * `url` tells the Disqus service the URL of the current page.
     * If undefined, Disqus will take the window.location.href.
     * This URL is used to look up or create a thread if disqus_identifier
     * is undefined. In addition, this URL is always saved when a thread is
     * being created so that Disqus knows what page a thread belongs to.
     */
    url: React.PropTypes.string,

    /**
     * `categoryId` tells the Disqus service the category to be used for
     * the current page. This is used when creating the thread on Disqus
     * for the first time.
     */
    categoryId: React.PropTypes.string
  },

  getDefaultProps: function () {
    return {
      shortname: null,
      identifier: null,
      title: null,
      url: null,
      category_id: null
    };
  },

  addDisqusScript: function () {
    var child = this.disqus = document.createElement('script');
    var parent = document.getElementsByTagName('head')[0] ||
                 document.getElementsByTagName('body')[0];

    child.async = true;
    child.type = 'text/javascript';
    child.src = '//' + this.props.shortname + '.disqus.com/embed.js';

    parent.appendChild(child);
  },

  removeDisqusScript: function () {
    if (this.disqus && this.disqus.parentNode) {
      this.disqus.parentNode.removeChild(this.disqus);
      this.disqus = null;
    }
  },

  componentDidMount: function () {
    if (typeof DISQUS === 'undefined') {
     this.addDisqusScript();
    } else {
      DISQUS.reset({
        reload: true
        /*
        config: function () {  
          this.page.shortname = props.shortname
          this.page.identifier = props.identifier;
          this.page.title = props.title;  
          this.page.url = props.url;
        }
        */
      })
    }
  },

  componentWillUnmount: function () {
    this.removeDisqusScript();
  },

  render: function () {
    // Prep Disqus configuration variables
    var disqusVars = DISQUS_CONFIG
      .filter(function (prop) {
        return !!this.props[camelCase(prop)];
      }, this)
      .map(function (prop) {
        return 'var disqus_' + prop + ' = \'' +
                this.props[camelCase(prop)].replace('\'', '\\\'') +
               '\';';
      }, this)
      .join('');

    return (
      <div>
        <div id="disqus_thread"></div>
        <script dangerouslySetInnerHTML={{__html: disqusVars}}></script>
        <noscript>Please enable JavaScript to view the <a href="http://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>
        <a href="http://disqus.com" className="dsq-brlink">blog comments powered by <span className="logo-disqus">Disqus</span></a>
      </div>
    );
  }
});
