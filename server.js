var express = require('express');
var app = express();
var fs = require('fs');

app.use(function(req, res, next){
  var filePath = req.url == "/docs/" ? 'build/docs/Home.html' : 'build' + req.url + '.html';

  fs.exists(filePath, function (exists) {
    exists ? res.sendfile(filePath) : res.send('404', 404);
  });

}).listen(3456);
