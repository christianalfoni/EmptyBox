var packageJson = require('./../../package.json');
var utils = require('./utils.js');
var Buffer = require('buffer').Buffer;
var Promise = require('es6-promise').Promise;
var path = require('path');
var fontsString = '';

var fonts = packageJson.blog.fonts;
var fontNames = fonts ? Object.keys(fonts) : {};
var baseUrl = 'https://google-webfonts-helper.herokuapp.com/api/fonts/{{ID}}?subsets=latin,latin-ext'

var resolveFontVariants = function (fontDescriptions) {
  return fontDescriptions.map(function (fontDescription, index) {
    var fontUrls = [];
    var font = fonts[fontNames[index]];
    var fontVariantIds = font.length ? font : [fontDescription.defVariant];
    return fontVariantIds.map(function (fontVariantId) {
      return utils.pluckPropsById(fontDescription.variants, fontVariantId, [
        'woff',
        'local',
        'fontFamily',
        'fontStyle',
        'fontWeight'
      ]);
    });
  });
};

var requestFontVariants = function (variants) {
  variants = utils.flatten(variants);
  var requests = variants.map(function (variant) {
    return utils.getFont(variant.woff);
  });
  return Promise.all(requests)
    .then(function (results) {
      return results.map(function (result, index) {
        variants[index].result = result;
        return variants[index];
      });
    });
};

var convertResultsToBase64 = function (variants) {
  return variants.map(function (variant) {
    variant.result = new Buffer(variant.result, 'binary').toString('base64');
    return variant;
  });
};

var writeFontsCSS = function (variants) {

  var css = variants.map(function (variant) {

    var local = variant.local.map(function (local) {
      return 'local(\'' + local + '\')';
    }).join(', ');

    return [
      '@font-face {',
      '  font-family: ' + variant.fontFamily + ';',
      '  font-style: ' + variant.fontStyle + ';',
      '  font-weight: ' + variant.fontWeight + ';',
      '  src: ' + local + ',',
      '    url(\'data:application/font-woff;base64,' + variant.result + '\') format(\'woff\');',
      '}'
    ].join('\n');
  });

  return css.join('\n');

};

module.exports = {
  load: function () {

    if (fonts) {

      var fontDescriptionRequests = fontNames.map(function (font) {
        return utils.getJson(baseUrl.replace('{{ID}}', font.toLowerCase()));
      });
      return Promise.all(fontDescriptionRequests)
        .then(resolveFontVariants)
        .then(requestFontVariants)
        .then(convertResultsToBase64)
        .then(writeFontsCSS)
        .then(function (css) {
          fontsString = css;
          console.log('Fonts are downloaded');
        })
        .catch(function (err) {
          console.log('Could not grab fonts', err, err.stack);
        });
    }

  },
  getCSS: function () {
    return fontsString;
  }
}
