var Promise = require('es6-promise').Promise;
var fs = require('fs');
var request = require('superagent');
var https = require('https');

module.exports = {
  readFile: function (path) {
    return new Promise(function (resolve, reject) {
      fs.readFile(path, function (err, file) {
        if (err) {
          return reject(err);
        }
        resolve(file.toString());
      });
    });
  },
  writeFile: function (path, content) {
    return new Promise(function (resolve, reject) {
      fs.writeFile(path, content, function (err) {
        if (err) {
          return reject('Could not write main file', err);
        }
        resolve();
      });
    });
  },
  getJson: function (url) {
    return new Promise(function (resolve, reject) {
      request
        .get(url)
        .set('Accept', 'application/json')
        .end(function (err, res) {
          if (err) {
            return reject(err);
          }
          resolve(JSON.parse(res.text));
        });
    });
  },
  getFont: function (url) {
    return new Promise(function (resolve, reject) {
      var file = '';
      var req = https.get(url, function (res) {
        res.setEncoding('binary');
        res.on('data', function (data) {
          file += data;
        });
        res.on('end', function () {
          resolve(file);
        });
      });
      req.on('error', function (e) {
        reject(e);
      });
      req.end();
    });
  },
  pluckPropsById: function (array, id, props) {
    var item = array.filter(function (item) {
      return item.id === id;
    }).pop();
    return Object.keys(item).reduce(function (result, key) {
      if (~props.indexOf(key)) {
        result[key] = item[key];
      }
      return result;
    }, {});
  },
  flatten: function (array) {
    return array.reduce(function (result, item) {
      return result.concat(item);
    }, []);
  }
}
