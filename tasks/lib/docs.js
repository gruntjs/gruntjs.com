'use strict';

exports.init = function() {
  var exports = {};
  var pathLib = require('path');

  exports.wikiAnchors = function(text) {
    var bu = '';
    text = text.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, function(wholeMatch, m1, m2) {
      var ext = /\/\//.test(m2);
      var path = ext ? m2 : pathLib.join(bu, m2.split(' ').join('-'));
      return '[' + m1 + '](' + path + ')';
    });

    text = text.replace(/\[\[([^\]]+)\]\]/g, function(wholeMatch, m1) {
      return '[' + m1 + '](' + pathLib.join(bu, m1.split(' ').join('-')) + '/)';
    });

    return text;
  };

  exports.anchorFilter = function(html) {
    // external links stay the same, local links get lowercase
    html = html.replace(/(<a[^>]*href=)(['"])(.*?)\2([^>]*>)/gi, function(_, a, q, h, b) {
      if (h.indexOf('http') === 0) {
        return a + q + h + q + b;
      } else {
        return a + q + h.toLowerCase() + q + b;
      }
    });
    return html;
  };

  return exports;
};
