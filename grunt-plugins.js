/**
 * grunt-plugins.js - gets the plugin list from npm
 * server.js serves the plugin list via the website.
 */

'use strict';

var request = require('request');
var async = require('async');
var fs = require('fs');

require('date-utils');

var pluginFile = 'src/plugin-list.json';

function requestIndex(url, callback) {
  setTimeout(function() {
    request({
      url: url,
      json: true
    }, function handlePluginList(error, response, body) {
      if (!error && response.statusCode === 200) {
        return callback(null, body.objects);
      } else {
        console.error(error);
        return callback(new Error(error), null);
      }
    });
  }, Math.random()* 10000);

}


function getPlugins(opts, callback) {
  console.log('Downloading plugin list, this will take some time...');

  var query = [];
  for(var i = 0; i < 25; i++) {
    var url = 'http://registry.npmjs.com/-/v1/search?text=keywords:gruntplugin&size=250&popularity=1.0&quality=1.0&from=' + i * 250;
    query.push(url);
  }

  async.concat(query, requestIndex, function(err, results) {
    console.log('Got ' + results.length + ' plugins');
    callback(results, err);
  });
}

function download(opts, callback) {
  opts = opts || {};

  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }

  fs.stat(pluginFile, function (err) {
    if (err || !opts.cache) {
      if (err) {
        console.log('File missing...');
      }
      getPlugins(opts, function (results) {
        console.log('Saving to file...');

        var plugins = [];
        results.forEach(function (result) {
          plugins.push({
            package: {
              name: result.package.name,
              author: result.package.author,
              description: result.package.description,
              links: {
                npm: result.package.links.npm
              }
            },
            score: {
              detail: {
                popularity: result.score.detail.popularity
              }
            }
          });
        });

        var pluginData = JSON.stringify({'aaData': plugins});

        fs.writeFile(pluginFile, pluginData, function (err) {
          if (err) {
            throw err;
          }
          console.log('Saved!');
          if (callback) {
            callback(err, true);
          }
        });
      });

    } else {
      console.log('File already cached. Manually delete to redownload...');
      callback();
    }
  });
}

module.exports.download = download;
