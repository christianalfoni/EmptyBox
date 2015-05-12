var path = require('path');
var marked = require('marked');
var articles = require('./articles.js');
var utils = require('./utils.js');

var injectRoutes = function (articles, template) {
  var routes = articles.map(function (article) {
    
    var dir = (article.isDraft ? 'drafts' : 'posts');
    return [
      'Page(\'' + article.url + '\', function (req) {\n',
      '  document.body.classList.add(\'article-loading\');\n',
      '  store.set(\'loadingArticle\', \'' + article.url + '\');\n',
      '  store.commit();\n',
      '  require.ensure([\'./../' + dir + '/' + article.file + '\'], function () {\n',
      '    document.body.classList.remove(\'article-loading\');\n',
      '    var content = require(\'./../' + dir + '/' + article.file + '\');\n',
      '    store.select(\'articles\', {file: \'' + article.file + '\'}).edit(parseArticle(\'' + article.file + '\', content));\n',
      '    if (store.select(\'currentArticle\').get() !== \'' + article.file + '\') { document.body.scrollTop = 0; }\n',
      '    store.set(\'currentArticle\', \'' + article.file + '\');\n',
      '    store.set(\'currentRoute\', \'' + article.url + '\');\n',
      '    store.set(\'loadingArticle\', null);\n',
      '    store.commit();\n',
      '    render();\n',
      '  });\n',
      '});\n'
    ].join('');
  });
  return template.replace('{{BLOG_ROUTES}}', routes.join(''));
};

// Todo: Add first parapraph from article
var injectState = function (state, template) {
  state.articles = articles.getAllWithoutContent();
  return template.replace('{{BLOG_STATE}}', JSON.stringify(state));
};

var injectHotAccepts = function (articles, template) {
  var hotAccepts = articles.map(function (article) {
    return './../' + (article.isDraft ? 'drafts' : 'posts') + '/' + article.file;
  });
  return template.replace('{{BLOG_HOTACCEPTS}}', JSON.stringify(hotAccepts));
};

var injectBaseCSS = function (template) {
  if (global.isProduction) {
    return template.replace('{{BASE_CSS_IN_DEV}}', '');
  }
  var baseCSS = [
    'require(\'./../styles/base.css\')',
    'require(\'./../styles/base-layout.css\')',
    'require(\'./../styles/base-components.css\')'
  ].join('\n');
  return template.replace('{{BASE_CSS_IN_DEV}}', baseCSS)
};

module.exports = function (articles) {
  var mainTemplatePath = path.resolve(__dirname, 'main-template.js');
  var state = {};
  return utils.readFile(mainTemplatePath)
    .then(function (template) {
      var mainFile = path.resolve(__dirname, '..', '..', 'core', '_main.jsx');
      template = injectRoutes(articles, template);
      template = injectBaseCSS(template);
      template = injectState(state, template);
      template = injectHotAccepts(articles, template);
      return utils.writeFile(mainFile, template);
    });
};
