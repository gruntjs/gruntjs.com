var express = require('express'),
    app = express(),
    fs = require('fs');

app.enable('strict routing');

// express configuration
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
app.get("/plugins", function(req, res) { res.sendfile('build/plugins.html'); });

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
