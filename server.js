var express = require('express');
var app = express();
var fs = require('fs');
var schedule = require('node-schedule');

schedule.scheduleJob('0 0 * * *', function(){
  console.log('Running plugin updater...');
  try {
  require('./grunt-plugins').download();
  } catch (e) {
    console.log(e);
  }
});

// enable express strict routing, see http://expressjs.com/api.html#app-settings
// for more info
app.enable('strict routing');

/**
 * express app configuration
 */
app.configure(function () {
  app.use(express.compress());
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
var port = process.env.PORT || 5678;
app.listen(port);
console.log('Starting a server on port: ' + port);

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
