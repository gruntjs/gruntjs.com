var express = require('express'),
    app = express(),
    fs = require('fs');

// TODO: refactor routes
// main route for root
app.get("/", function(req, res) {
  var filePath = 'build' + req.url + '.html';
  if(req.url === "/") { filePath = 'build/index.html'; }
  fs.exists(filePath, function (exists) {
    exists ? res.sendfile(filePath) : res.send('404', 404);
  });
});

// api routes
app.get("/api/*", function(req, res) {
  req.url = req.url.toLowerCase();

  var filePath = 'build' + req.url + '.html';
  if(req.url === "/api/") {
    filePath = 'build/api/grunt.html';
  }

  fs.exists(filePath, function (exists) {
    exists ? res.sendfile(filePath) : res.send('404', 404);
  });
});

// doc routes
app.get("/docs/*", function(req, res) {
  req.url = req.url.toLowerCase();

  var filePath = req.url == "/docs/" ? 'build/docs/getting-started.html' : 'build' + req.url + '.html';
  if(req.url === "/") {
    filePath = 'build/index.html';
  }

  fs.exists(filePath, function (exists) {
    exists ? res.sendfile(filePath) : res.send('404', 404);
  });
});

// community route
app.get("/community", function(req, res) { res.sendfile('build/community.html'); });
// news route
app.get("/news", function(req, res) { res.sendfile('build/news.html'); });
// redirect the getting started page to docs
app.get("/getting-started", function(req, res) { res.redirect('/docs/getting-started') });

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
});

// server port
app.listen(5678);
