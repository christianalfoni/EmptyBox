var path = require('path');
var packageJson = require('./../../package.json');
var Promise = require('es6-promise').Promise;
var utils = require('./utils.js');

module.exports = function () {

  var indexPath = path.resolve(__dirname, '..', '..', 'index.html');
  var cssHighlightFile = packageJson.blog.css.highlight;
  var cssHighlightPath = path.resolve(__dirname, '..', '..', cssHighlightFile);
  var cssBasePath = path.resolve(__dirname, '..', '..', 'styles', 'base.css');
  var cssLayoutPath = path.resolve(__dirname, '..', '..', 'styles', 'base-layout.css');
  var cssComponentsPath = path.resolve(__dirname, '..', '..', 'styles', 'base-components.css');
  return Promise.all([
    utils.readFile(indexPath),
    utils.readFile(cssHighlightPath),
    utils.readFile(cssBasePath),
    utils.readFile(cssLayoutPath),
    utils.readFile(cssComponentsPath)
  ])
  .then(function (results) {
    var index = results[0];
    var baseCSS = results[1] + '\n' + results[2] + '\n' + results[3] + '\n' + results[4];
    index = index.replace('{{BLOG_TITLE}}', packageJson.name);
    index = index.replace('{{BASE_CSS}}', baseCSS);
    return index;
  })
  .catch(function (err) {
    console.error('Could not load required files', err);
  });

};
