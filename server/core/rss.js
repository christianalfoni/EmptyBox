var Feed = require('feed');
var articles = require('./articles.js');

module.exports = function(req, res) {

  var feed = new Feed({
    title: 'Christian Alfoni',
    description: 'Javascript developer blog',
    link: 'http://www.christianalfoni.com',
    image: 'https://lh6.googleusercontent.com/-Am9E8NwuXuA/UuFhsL06WPI/AAAAAAAAAUo/etKU6VGmdW4/s250-no/me.jpg',
    copyright: 'All rights reserved 2015, Christian Alfoni',
    author: {
      name: 'Christian Alfoni',
      email: 'christianalfoni@gmail.com',
      link: 'http://www.christianalfoni.com'
    }
  });
  feed.addCategory('JavaScript');
  var rssArticles = articles.getAllWithoutContent();
  rssArticles.forEach(function(article) {
    feed.addItem({
      title: article.title,
      link: 'http://www.christianalfoni.com' + article.url,
      description: article.description,
      date: new Date(article.published)
    });
  });
  res.type('application/rss+xml');

  // Content encoded fix, should not be there
  var feedString = feed.render('rss-2.0').replace(/\<content\:encoded\/\>/g, '');
  res.send(feedString);

};
