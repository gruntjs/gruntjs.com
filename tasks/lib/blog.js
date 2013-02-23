'use strict';

exports.init = function(/*grunt*/) {
  var exports = {};

  exports.formatDate = function(postDate) {
    var dateFormat = postDate.split('-'),
      monthNames = [ 'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December' ];
    return monthNames[parseInt(dateFormat[1], 10) - 1] + ' ' + dateFormat[2] + ', ' + dateFormat[0];
  };

  return exports;
};
