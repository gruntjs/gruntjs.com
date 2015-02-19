/**
 * grunt-plugins.js - gets the plugin list from npm
 * server.js serves the plugin list via the website.
 */
var request = require('request');
var _ = require('lodash');
var async = require('async');
var ent = require('ent');
var fs = require('fs');

require('date-utils');

// A list of grunt plugins that have wronged!
var bannedPlugins = [
  'grunt-contrib-jst-2', // Reason: unofficial contrib plugin
  'loadnpmtasks',  // Reason: not a plugin
  'dp-grunt-contrib-copy',
  'grunt-contrib-yohtml', // Reason: unofficial contrib plugin
  'grunt-test',
  'grunt-testingoscar123',
  'assemble-less-variables',
  'grunt-contrib-eslint'
];

var pluginFile = 'build/plugin-list.json';

function getPlugin(item, callback) {
  var name = item.key[1];
  var url = 'https://skimdb.npmjs.com/registry/' + name;
  request({url: url, json: true}, function handlePlugin(error, response, body) {
    if (!error && response.statusCode == 200) {
      callback(null, condensePlugin(body));
    } else {
      console.log('Failed to get data for:', name);
      callback(null, null);
    }
  });
}

function getDownloads(item, callback) {
  var name = item.name;
  var url = 'https://api.npmjs.org/downloads/point/last-month/' + name;
  request({url: url, json: true}, function handlePlugin(error, response, body) {
    if (!error && response.statusCode == 200) {
      if (body.downloads) {
        item.dl = body.downloads;
      } else {
        item.dl = 0;
      }
      callback(null, item);
    } else {
      callback(null, item);
    }
  });
}

function condensePlugin(plugin) {
  var keywords = _.last(_.values(plugin.versions)).keywords;

  var gruntVersion,
    latestTagInfo = plugin.versions[ plugin['dist-tags'].latest ];

  if (latestTagInfo && latestTagInfo.peerDependencies && latestTagInfo.peerDependencies.grunt) {
    gruntVersion = latestTagInfo.peerDependencies.grunt;
  }

  return {
    name: plugin.name,
    ds: plugin.description != null ? ent.encode(plugin.description) : '',
    a: (plugin.author && plugin.author.name != null) ? plugin.author.name : '',
    url: plugin.url,
    v: gruntVersion,
    // only get created and modified date, leave out all of the version timestamps
    m: plugin.time.modified
    //created: plugin.time.created
  };
}

function getPlugins(opts, callback) {
  console.log('Downloading plugin list, this will take 40 or more seconds...');

  async.waterfall([
    // download plugin names based on the keyword
    function(callback) {
      var keyword = 'gruntplugin';
      var url = 'https://skimdb.npmjs.com/registry/_design/app/_view/byKeyword?startkey=[%22' +
        keyword + '%22]&endkey=[%22' + keyword + '%22,{}]&group_level=3';
      request({url: url, json: true}, function handlePluginList(error, response, body) {
        if (!error && response.statusCode == 200) {
          callback(null, body.rows);
        } else {
          callback(null, new Error(error));
        }
      });
    },
    function(results, callback){
      console.log('Downloading npm data for each plugin...');

      var filtered = _.filter(results, function (el) {
        return _.indexOf(bannedPlugins, el.key[1]) == -1;
      });

      async.mapLimit(filtered, 200, getPlugin, function(err, results){
        // registry can be out of sync with deleted plugins
        var results = _.reject(results, function(plugin) { return plugin === null; });
        callback(err, results);
      });
    },
    function(results, callback){
      console.log('Fetching download information...');

      async.mapLimit(results, 200, getDownloads, function(err, results){
        callback(err, results);
      });
    }
  ], function (err, pluginList) {
    if (err) {
      console.log(err);
    } else {
      //console.log('Downloading GitHub data for each plugin...');
      console.log('Saving to file...');

      var pluginData = JSON.stringify({ "aaData": pluginList });

      fs.writeFile(pluginFile, pluginData, function (err) {
        if (err) throw err;
        console.log('Saved!');
        if (callback) callback(err, true);
      });
    }
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
      getPlugins(opts, callback);

    } else {
      console.log('File already cached. Manually delete to redownload...');
    }
  });
}

module.exports.download = download;


