var express = require('express'),
  app = express(),
  fs = require('fs'),
  Q = require('q'),
  gruntPlugins = require('./grunt-plugins'),
  crypto = require('crypto');

// enable express strict routing, see http://expressjs.com/api.html#app-settings
// for more info
app.enable('strict routing');

/**
 * express app configuration
 */
app.configure(function(){
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(express.static(__dirname + '/build'));
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
  app.use(app.router);
  app.use(function(req, res, next) {
    if(req.url.substr(-1) == '/' && req.url.length > 1)
      res.redirect(301, req.url.slice(0, -1));
    next();
  });
});

// server port
var port = process.env.PORT || 5678;
app.listen(port);
console.log('Server is running on port: ' + port);

// TODO: refactor routes
// main route for root
app.get("/", function(req, res) {
  var filePath = 'build' + req.url + '.html';
  if(req.url === "/") { filePath = 'build/index.html'; }
  fs.exists(filePath, function (exists) {
    exists ? res.sendfile(filePath) : res.sendfile('build/404.html', 404);
  });
});

// api routes
app.get("/api*", function(req, res) {
  req.url = req.url.toLowerCase();
  var filePath = 'build' + req.url + '.html';

  // redirect to the main api page, fix slashes and folder issues
  if (req.url == "/api/") {
    res.redirect(301, '/api/grunt');
    return;
  } else if(req.url.substr(-1) == '/' && req.url.length > 1) {
    res.redirect(301, req.url.slice(0, -1));
    return;
  }

  fs.exists(filePath, function (exists) {
    exists ? res.sendfile(filePath) : res.sendfile('build/404.html', 404);
  });
});

// news route
app.get("/blog*", function(req, res) {
  var filePath = 'build' + req.url + '.html';
  if (req.url == "/blog") {
    res.sendfile('build/blog/index.html');
  } else {

    fs.exists(filePath, function (exists) {
      exists ? res.sendfile(filePath) : res.sendfile('build/404.html', 404);
    });
  }
});

// plugins route
app.get("/plugins*", function(req, res) { res.sendfile('build/plugins.html'); });

// plugin list route
app.get("/plugin-list", function(req, res) {
  // get the plugin list
  pluginListEntity.then(function(entity) {
    // Allow Cross-origin resource sharing
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Content-Type", "application/json");
    res.setHeader('ETag', entity.etag);
    /*
    // TODO: disabled for now.
    if(req.headers['if-none-match'] === entity.etag) {
      res.statusCode = 304;
      res.end();
      return;
    }
    */
    res.statusCode = 200;
    res.end(new Buffer(entity.json));
  }).fail(function(e) {
      // TODO: need a fail page
      res.sendfile('build/404.html', 400)
  });
});

// doc routes
app.get("/*", function(req, res) {
  req.url = req.url.toLowerCase();
  var filePath = 'build/docs/' + req.url + '.html';

  if(req.url.substr(-1) == '/' && req.url.length > 1) {
    res.redirect(301, req.url.slice(0, -1));
    return;
  }
  else if(req.url.indexOf('/grunt')==0) {
    res.redirect(301, '/api' + req.url);
    return;
  }

  fs.exists(filePath, function (exists) {
    exists ? res.sendfile(filePath) : res.sendfile('build/404.html', 404);
  });
});

// plugin list route


// Update once every hour
const UPDATE_INTERVAL_IN_SECONDS = 60*60;
// pluginListEntity - promise {etag: '', json: ''}
// using a promise so that clients can connect and wait for the initial entity
var pluginListEntity = getPluginListEntity();


function getPluginListEntity() {
  var deferred = Q.defer();
  gruntPlugins.fetchPluginList().then(
    function(pluginList) {
      var entity = {
        json: JSON.stringify(pluginList)
      };
      var shasum = crypto.createHash('sha1');
      shasum.update(entity.json);
      entity.etag = shasum.digest('hex');
      deferred.resolve(entity);
      // update the entity
      pluginListEntity = deferred.promise;
    }).fail(function(e) {
      deferred.reject(e);
    });
  return deferred.promise;
}
// Update function
setInterval(function() {
  getPluginListEntity();
}, UPDATE_INTERVAL_IN_SECONDS * 1000);