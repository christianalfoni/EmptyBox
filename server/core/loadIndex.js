var fs = require('fs');
var path = require('path');
var packageJson = require('./../../package.json');
var Promise = require('es6-promise').Promise;

var readFile = function (path) {
  return new Promise(function (resolve, reject) {
    fs.readFile(path, function (err, file) {
      if (err) {
        return reject(err);
      }
      resolve(file.toString());
    });
  })
};

module.exports = function () {

  var indexPath = path.resolve(__dirname, '..', '..', 'index.html');
  var cssFile = packageJson.blog.css.highlight;
  var cssPath = path.resolve(__dirname, '..', '..', cssFile);
  return Promise.all([
    readFile(indexPath),
    readFile(cssPath)
  ])
  .then(function (results) {
    var index = results[0];
    var baseCSS = results[1];
    index = index.replace('{{BLOG_TITLE}}', packageJson.name);
    index = index.replace('{{BASE_CSS}}', baseCSS);
    return index;
  })
  .catch(function (err) {
    console.error('You not load required files', err);
  });

};
