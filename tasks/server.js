/*
 * gruntjs.com custom server
 * http://gruntjs.com/
 *
 * Copyright (c) 2013 grunt contributors
 * Licensed under the MIT license.
 */

module.exports = function (grunt) {
  'use strict';

  var express = require('express'),
    app = express(),
    fs = require('fs'),
    Q = require('q'),
    gruntPlugins = require('../grunt-plugins'),
    crypto = require('crypto');

  /**
   * Custom task to generate the plugins page
   */
  grunt.registerTask('server', 'Start the Grunt Site Server', function () {
    // keep the server task running
    this.async();

    // enable express strict routing, see http://expressjs.com/api.html#app-settings
    // for more info
    app.enable('strict routing');

    /**
     * express app configuration
     */
    app.configure(function () {
      app.use(express.methodOverride());
      app.use(express.bodyParser());

      // strip slashes
      app.use(function (req, res, next) {
        if (req.url.substr(-1) === '/' && req.url.length > 1) {
          res.redirect(301, req.url.slice(0, -1));
        } else {
          next();
        }
      });
      // use the router
      app.use(app.router);
      // use the static router
      app.use(express.static('build'));
      // if nothing matched, send 404
      app.use(function (req, res) {
        res.status(404).sendfile('build/404.html');
      });
      app.use(express.errorHandler({
        dumpExceptions:false,
        showStack:false
      }));

    });

    /**
     * Server configuration
     */
    var port = process.env.PORT || grunt.config.get('server_port');
    app.listen(port);
    console.log('Starting a server on port: ' + port);
    // update server port for later use if needed
    grunt.config('server_port', port);

    /**
     * express app router
     */
    app.get('/', function (req, res, next) {
      var filePath = 'build' + req.url + '.html';
      if (req.url === '/') {
        filePath = 'build/index.html';
      }

      fs.exists(filePath, function (exists) {
        if (exists) {
          res.sendfile(filePath);
        } else {
          next();
        }
      });
    });

    // api routes
    app.get('/api*', function (req, res, next) {
      req.url = req.url.toLowerCase();
      var filePath = 'build' + req.url + '.html';

      // redirect to the main api page, fix slashes and folder issues
      if (req.url === '/api') {
        res.redirect(301, '/api/grunt');
        return;
      }

      fs.exists(filePath, function (exists) {
        if (exists) {
          res.sendfile(filePath);
        } else {
          next();
        }
      });
    });

    // news route
    app.get('/blog*', function (req, res, next) {
      var cleanUrl = req.url.split('?')[0];
      var filePath = 'build' + cleanUrl + '.html';
      
      if (cleanUrl === '/blog') {
        res.sendfile('build/blog.html');
      } else {

        fs.exists(filePath, function (exists) {
          if (exists) {
            res.sendfile(filePath);
          } else {
            next();
          }
        });
      }
    });

    // plugins route
    app.get('/plugins*', function (req, res) {
      res.sendfile('build/plugins.html');
    });

    // plugin list route
    app.get('/plugin-list.json', function (req, res, next) {
      // get the plugin list
      /*
       pluginListEntity.then(function (entity) {
       // Allow Cross-origin resource sharing
       res.setHeader('Access-Control-Allow-Origin', '*');
       res.setHeader('Content-Type', 'application/json');
       res.setHeader('ETag', entity.etag);
       /*
       // TODO: disabled for now.
       if(req.headers['if-none-match'] === entity.etag) {
       res.statusCode = 304;
       res.end();
       return;
       }
       res.statusCode = 200;
       res.end(new Buffer(entity.json));

       }).fail(function () {
       next();
       });
       */

      var http = require('http');

      var options = {
        host: 'vf.io',
        path: '/p.json'
      };

      var request = http.get(options, function(response){
        var pluginData = '';

        response.on('data', function(chunk){
          pluginData += chunk
        });

        response.on('end', function(){
          res.statusCode = 200;
          res.json(JSON.parse(pluginData));
        })

      }).on("error", function(e){
          console.log("Got error: " + e.message);
          next();
        });
    });


    // rss atom feed
    app.get('/rss', function (req, res) {
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Charset', 'utf-8');
      res.sendfile('build/atom.xml');
    });

    // final route, if nothing else matched, this will match docs
    app.get('*', function (req, res, next) {
      req.url = req.url.toLowerCase();
      var filePath = 'build/docs/' + req.url + '.html';

      if (req.url.indexOf('/grunt') === 0) {
        res.redirect(301, '/api' + req.url);
        return;
      }

      fs.exists(filePath, function (exists) {
        if (exists) {
          res.sendfile(filePath);
        } else {
          next();
        }
      });

    });

    /**
     * Plugin List Helpers
     */
    // Update once every 12 hours
    var UPDATE_INTERVAL_IN_SECONDS = 60 * 60 * 12;
    // pluginListEntity - promise {etag: '', json: ''}
    // using a promise so that clients can connect and wait for the initial entity

    function getPluginListEntity() {
      var deferred = Q.defer();
      gruntPlugins.fetchPluginList().then(
        function (pluginList) {
          var entity = {
            json: JSON.stringify({ "aaData": pluginList })
          };
          var shasum = crypto.createHash('sha1');
          shasum.update(entity.json);
          entity.etag = shasum.digest('hex');
          deferred.resolve(entity);
          // update the entity
          pluginListEntity = deferred.promise;
        }).fail(function (e) {
          deferred.reject(e);
        });
      return deferred.promise;
    }

    var pluginListEntity = getPluginListEntity();
    // Update function
    setInterval(function () {
      getPluginListEntity();
    }, UPDATE_INTERVAL_IN_SECONDS * 1000);

  });
};
