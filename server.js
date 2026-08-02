'use strict';

var express = require('express');
var compression = require('compression');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var errorHandler = require('errorhandler');
var app = express();
var fs = require('fs');
var path = require('path');
var schedule = require('node-schedule');

schedule.scheduleJob('12 2 * * *', function() {
  console.log('Running plugin updater...');
  try {
    require('./grunt-plugins').download();
  } catch (e) {
    console.log(e);
  }
});

var defaultSendOpts = {
  root: __dirname,
  headers: {
    'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600'
  }
};

// enable express strict routing, see http://expressjs.com/api.html#app-settings
// for more info
app.enable('strict routing');

/**
 * express app configuration
 */
app.use(compression());
app.use(methodOverride());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.set('views', path.join(__dirname, 'src', 'tmpl'));
app.set('view engine', 'pug');

/**
 * Strip trailing slashes
 *
 * Redirect "/foo/" to "/foo". Browsers interpret absolute paths in Location
 * as relative to the current origin.
 *
 * Avoid redirecting to a paths that browsers may interpret as URLs to other sites,
 * such as "//foo" or "http://". https://github.com/gruntjs/gruntjs.com/issues/231
 *
 * Keep later middleware simple and secure by rejecting path escapes. Test with
 * `curl -v http://localhost:5678/ --request-target '/../../secret'`
 */
app.use(function (req, res, next) {
  // Strip duplicate slashes "//foo/bar//quux//" => "/foo/bar/quux/"
  //
  // SECURITY: Remove (or resolve within the same URL) any path escape "/../foo/../bar" => "/bar"
  var normalUrl = path.normalize(req.url);
  // Strip trailing slash
  if (normalUrl.endsWith('/')) {
    normalUrl = normalUrl.slice(0, -1);
  }

  if (req.url !== normalUrl && req.url !== '/' && normalUrl !== '/') {
    res.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
    res.redirect(301, normalUrl);
  } else {
    next();
  }
});

/**
 * Server configuration
 */
var port = process.env.PORT || 5678;
app.listen(port);
console.log('Starting a server on port: ' + port);

/**
 * express app router
 */
app.get('/', function (req, res, next) {
  var cleanUrl = req.url.split('?')[0];
  var filePath;
  if (cleanUrl === '/') {
    filePath = 'build/index.html';
  } else {
    filePath = 'build' + cleanUrl + '.html';
  }

  fs.exists(filePath, function (exists) {
    if (exists) {
      res.sendFile(filePath, defaultSendOpts);
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
    res.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
    res.redirect(301, '/api/grunt');
    return;
  }

  fs.exists(filePath, function (exists) {
    if (exists) {
      res.sendFile(filePath, defaultSendOpts);
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
    res.sendFile('build/blog.html', defaultSendOpts);
  } else {

    fs.exists(filePath, function (exists) {
      if (exists) {
        res.sendFile(filePath, defaultSendOpts);
      } else {
        next();
      }
    });
  }
});

// plugins route
app.get('/plugins*', function (req, res) {
  res.sendFile('build/plugins.html', defaultSendOpts);
});

// blm route
app.get('/blm*', function (req, res) {
  res.sendFile('build/blm.html', defaultSendOpts);
});

// rss atom feed
app.get('/rss', function (req, res) {
  res.setHeader('Content-Type', 'application/xml; charset=UTF-8');
  res.sendFile('build/atom.xml', defaultSendOpts);
});

// final route, if nothing else matched, this will match docs
app.get('*', function (req, res, next) {
  var cleanUrl = req.url.toLowerCase().split('?')[0];
  var filePath = 'build/docs/' + cleanUrl + '.html';

  if (cleanUrl.indexOf('/grunt.') === 0) {
    res.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
    res.redirect(301, '/api' + cleanUrl);
    return;
  }

  fs.exists(filePath, function (exists) {
    if (exists) {
      res.sendFile(filePath, defaultSendOpts);
    } else {
      next();
    }
  });

});

/**
 * express app configuration after routes
 */
// use the static router
app.use(express.static('build', {
  setHeaders: function (res) {
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
  }
}));
// if nothing matched, send 404
app.use(function (req, res) {
  res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
  res.status(404).render('404', {
    page: 'notfound',
    title: '404 Not Found'
  });
});
app.use(errorHandler({
  dumpExceptions: false,
  showStack: false
}));
