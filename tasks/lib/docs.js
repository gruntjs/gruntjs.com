'use strict';

exports.init = function(/*grunt*/) {
  var exports = {},
    Path = require('path');

  exports.wikiAnchors = function(text) {
    var bu = '';
    text = text.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, function(wholeMatch, m1, m2) {
      var ext = /\/\//.test(m2),
        path = ext ? m2 : Path.join(bu, m2.split(' ').join('-'));
      return "["+m1+"](" + path + ")";
    });

    text = text.replace(/\[\[([^\]]+)\]\]/g, function(wholeMatch, m1) {
      return "["+m1+"](" + Path.join(bu, m1.split(' ').join('-')) + "/)";
    });

    return text;
  };

  return exports;
};
