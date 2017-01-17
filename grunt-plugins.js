/**
 * grunt-plugins.js - gets the plugin list from npm
 * server.js serves the plugin list via the website.
 */

'use strict';

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
  'grunt-contrib-quickstart', // Reason: unofficial contrib plugin
  'grunt-contrib-coffeeify', // Reason: unofficial contrib plugin
  'grunt-contrib-nodefy', // Reason: unofficial contrib plugin
  'grunt-contrib-handlebars-rhengles', // Reason: unofficial contrib plugin
  'grunt-contrib-juicepress', // Reason: unofficial contrib plugin
  'grunt-contrib-build-crx', // Reason: unofficial contrib plugin
  'grunt-test', // Reason: no real plugin
  'grunt-testingoscar123', // Reason: no real plugin
  'assemble-less-variables',
  'grunt-contrib-eslint', // Reason: unofficial contrib plugin
  'grunt-contrib-htmlone', // Reason: unofficial contrib plugin
  'grunt-contrib-coffeeify', // Reason: unofficial contrib plugin
  'grunt-contrib-compass-sourcemap', // Reason: unofficial contrib plugin
  'grunt-contrib-spritify', // Reason: unofficial contrib plugin
  'grunt-contrib-include', // Reason: unofficial contrib plugin
  'grunt-contrib-juicepress', // Reason: unofficial contrib plugin
  'grunt-contrib-hogan', // Reason: unofficial contrib plugin
  'grunt-contrib-stylus2tss', // Reason: unofficial contrib plugin, no documentation
  'grunt-contrib-smartdoc', // Reason: unofficial contrib plugin
  'grunt-contrib-cjsc', // Reason: unofficial contrib plugin
  'grunt-contrib-compressor', // Reason: unofficial contrib plugin
  'grunt-contrib-license-report', // Reason: unofficial contrib plugin
  'grunt-contrib-tishadow', // Reason: unofficial contrib plugin
  'grunt-contrib-smartsprites', // Reason: unofficial contrib plugin, no documentation
  'grunt-contrib-rubylint', // Reason: unofficial contrib plugin
  'grunt-contrib-lualint', // Reason: unofficial contrib plugin
  'grunt-contrib-levin-usemin', // Reason: unofficial contrib plugin
  'grunt-contrib-quickstart', // Reason: unofficial contrib plugin
  'grunt-contrib-i18next', // Reason: unofficial contrib plugin
  'grunt-contrib-ftpush',  // Reason: unofficial contrib plugin
  'grunt-mindirect', // Reason: duplicate of contrib-uglify
  'private-grunt-contrib-uglify', // Reason: duplicate of contrib-uglify
  'grunt-handlebars-static', // Reason: duplicate of compile-handlebars
  'grunt-contrib-jshint-reporter-tweaks', // Reason: unofficial contrib plugin
  'grunt-sass-fork', // Reason: duplicate of grunt-contrib-sass
  'grunt-gh-deploy', // Reason: duplicate of grunt-gh-pages
  'grunt-github-pages', // Reason: duplicate of grunt-gh-pages
  'grunt-contrib-cssmin-pre-2.1.0', // Reason: unofficial contrib plugin
  'private-grunt-contrib-cssmin', // Reason: unofficial contrib plugin
  'private-grunt-contrib-stylus', // Reason: unofficial contrib plugin
  'grunt-contrib-zopfli', // Reason: unofficial contrib plugin, duplicate of grunt-zopfli
  'grunt-htmlmin', // Reason: duplicate of contrib-htmlmin
  'grunt-symbolic-link', // Reason: duplicate of contrib-symlink
  'grunt-symlink', // Reason: duplicate of contrib-symlink
  'grunt-symlinks', // Reason: duplicate of contrib-symlink
  'grunt-coffee', // Reason: duplicate of contrib-coffee
  'grunt-coffee-lint', // Reason: duplicate of grunt-coffeelint, missing documentation
  'grunt-less', // Reason: duplicate of grunt-contrib-less
  'grunt-scsslint', // Reason: duplicate of grunt-scss-lint
  'grunt-css', // Reason: deprecated
  'ngbp-contrib-lintcss', // Reason: missing documentation, duplicate of grunt-contrib-csslint
  'ngbp-contrib-mincss', // Reason: missing documentation, duplicate of grunt-contrib-cssmin
  'grunt-init-test', // Reason: missing documentation, does nothing
  'grunt-contrib-githooks', // Reason: unofficial contrib plugin
  'grunt-contrib-stylus-map', // Reason: unofficial contrib plugin
  'grunt-contrib-dox', // Reason: unofficial contrib plugin
  'grunt-contrib-requiregrep', // Reason: unofficial contrib plugin
  'grunt-contrib-litchi', // Reason: unofficial contrib plugin
  'grunt-contrib-remotecordova', // Reason: unofficial contrib plugin
  'grunt-contrib-environment', // Reason: unofficial contrib plugin
  'grunt-contrib-lessify', // Reason: unofficial contrib plugin
  'grunt-contrib-appbuilder' // Reason: unofficial contrib plugin
];

var pluginFile = 'build/plugin-list.json';

function condensePlugin(plugin) {
  var gruntVersion;
  var latestTagInfo = plugin.versions[ plugin['dist-tags'].latest ];

  if (latestTagInfo && latestTagInfo.peerDependencies && latestTagInfo.peerDependencies.grunt) {
    gruntVersion = latestTagInfo.peerDependencies.grunt;
  }

  return {
    name: plugin.name,
    ds: plugin.description != null ? ent.encode(plugin.description) : '',
    a: plugin.author && plugin.author.name != null ? plugin.author.name : '',
    url: plugin.url,
    v: gruntVersion,
    // only get created and modified date, leave out all of the version timestamps
    m: plugin.time.modified
    //created: plugin.time.created
  };
}

function getPlugin(item, callback) {
  var name = item.key[1];
  var url = 'https://skimdb.npmjs.com/registry/' + name;
  request({
    url: url,
    json: true
  }, function handlePlugin(error, response, body) {
    if (!error && response.statusCode === 200) {
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
  request({
    url: url,
    json: true
  }, function handlePlugin(error, response, body) {
    if (!error && response.statusCode === 200) {
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

function getPlugins(opts, callback) {
  console.log('Downloading plugin list, this will take 40 or more seconds...');

  async.waterfall([
    // download plugin names based on the keyword
    function(callback) {
      var keyword = 'gruntplugin';
      var url = 'https://skimdb.npmjs.com/registry/_design/app/_view/byKeyword?startkey=[%22' +
        keyword + '%22]&endkey=[%22' + keyword + '%22,{}]&group_level=3';
      request({
        url: url,
        json: true
      }, function handlePluginList(error, response, body) {
        if (!error && response.statusCode === 200) {
          callback(null, body.rows);
        } else {
          callback(null, new Error(error));
        }
      });
    },
    function(results, callback) {
      console.log('Downloading npm data for each plugin...');

      var filtered = _.filter(results, function (el) {
        return _.indexOf(bannedPlugins, el.key[1]) === -1;
      });

      async.mapLimit(filtered, 200, getPlugin, function(err, results) {
        // registry can be out of sync with deleted plugins
        var res = _.reject(results, function(plugin) {
          return plugin === null;
        });
        callback(err, res);
      });
    },
    function(results, callback) {
      console.log('Fetching download information...');

      async.mapLimit(results, 200, getDownloads, function(err, results) {
        callback(err, results);
      });
    }
  ], function (err, pluginList) {
    if (err) {
      console.log(err);
    } else {
      //console.log('Downloading GitHub data for each plugin...');
      console.log('Saving to file...');

      var pluginData = JSON.stringify({'aaData': pluginList});

      fs.writeFile(pluginFile, pluginData, function (err) {
        if (err) {
          throw err;
        }
        console.log('Saved!');
        if (callback) {
          callback(err, true);
        }
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
      callback();
    }
  });
}

module.exports.download = download;
