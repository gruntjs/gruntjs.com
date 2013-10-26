/**
 * grunt-plugins.js - gets the plugin list from npm
 * server.js serves the plugin list via the website.
 */
var request = require('request');
var _ = require('lodash');
var Q = require('q');

require('date-utils');

function condensePlugin(plugin) {
  var keywords = keywords = _.last(_.values(plugin.versions)).keywords;

  var gruntVersion,
    latestTagInfo = plugin.versions[ plugin['dist-tags'].latest ];

  if (latestTagInfo && latestTagInfo.peerDependencies && latestTagInfo.peerDependencies.grunt) {
    gruntVersion = latestTagInfo.peerDependencies.grunt;
  }

  return {
    name: plugin.name,
    description: plugin.description,
    author: plugin.author,
    url: plugin.url,
    github: plugin.repository != null ? plugin.repository.url : "",
    keywords: keywords,
    gruntVersion: gruntVersion,
    // only get created and modified date, leave out all of the version timestamps
    time: {modified: plugin.time.modified, created: plugin.time.created}
  };
}

function fetchPluginList() {
  return Q.fcall(function fetchPluginList() {
    var deferred = Q.defer();
    var keyword = 'gruntplugin';
    var url = 'http://isaacs.iriscouch.com/registry/_design/app/_view/byKeyword?startkey=[%22' +
      keyword + '%22]&endkey=[%22' + keyword + '%22,{}]&group_level=3';
    request({url: url, json: true}, function handlePluginList(error, response, body) {
      if(!error && response.statusCode == 200) {
        deferred.resolve(body.rows);
      } else {
        deferred.reject(new Error(error));
      }
    });
    return deferred.promise;
  }).then(function getPlugin(list) {
      var results = _.map(list, function(item) {
        var deferred = Q.defer();
        var name = item.key[1];
        var url = 'http://isaacs.iriscouch.com/registry/' + name;
        request({url: url, json: true}, function handlePlugin(error, response, body) {
          if(!error && response.statusCode == 200) {
            deferred.resolve(condensePlugin(body));
          } else {
            deferred.reject(new Error(error));
          }
        });
        return deferred.promise;
      });
      return Q.all(results);
  }).then(function getDownloads(results) {
      var resultsWithDownloads = _.map(results, function(result) {
        var deferred = Q.defer();

        var today = Date.today();
        var oneMonthAgo = today.clone().add({months: -1});

        var startKey = JSON.stringify([result.name, oneMonthAgo.toYMD()]);
        var endKey = JSON.stringify([result.name, today.toYMD()]);

        var url = 'http://isaacs.iriscouch.com/downloads/_design/app/_view/pkg?startkey=' + startKey + '&' + 'endkey=' + endKey;

        request({url: url, json: true}, function handlePlugin(error, response, body) {
          if (!error && response.statusCode == 200) {
            if (body.rows && body.rows.length) {
              result.downloads = body.rows[0].value;
            } else {
              result.downloads = 'N/A';
            }

            deferred.resolve(result);
          } else {
            deferred.reject(new Error(error));
          }
        });

        return deferred.promise;
      });

      return Q.all(resultsWithDownloads);
  });
}

exports.fetchPluginList = fetchPluginList;
