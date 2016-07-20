'use strict';

exports.init = function () {
  var exports = {};

  exports.formatDate = function (postDate) {
    var dateFormat = postDate.split('-');
    var monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];
    return monthNames[parseInt(dateFormat[1], 10) - 1] + ' ' + dateFormat[2] + ', ' + dateFormat[0];
  };

  exports.atomIDnTimeStampChurner = function (urlst, postDate) {
    /* Atom id and timestamp generator by hesido.com */
    /* Free to use in any condition, modify, distribute */
    function padZero(toPad) {
      return String(toPad).replace(/(^.$)/, '0$1');
    }

    function padDoubleZero(toPad) {
      return String(toPad).replace(/(^.$)/, '0$1').replace(/(^..$)/, '0$1');
    }

    if (!urlst || urlst == null || urlst === '') {
      return false;
    }

    var htreg = /^http:\/\//;
    var nureg = /#/g;
    var dareg = /(\/)/;
    var loreg = /([^\/]*[^\/]$)/;
    var urlpr = urlst.replace(htreg, '');

    if (urlpr.indexOf('/') === -1) {
      urlpr += '/';
    }

    var d = new Date(postDate);

    var utcf = d.getTimezoneOffset();
    var ypad = d.getFullYear();
    var ypadutc = d.getUTCFullYear();
    var mpad = padZero(d.getMonth() + 1);
    var mpadutc = padZero(d.getUTCMonth() + 1);
    var dpad = padZero(d.getDate());
    var dpadutc = padZero(d.getUTCDate());
    var SHour = padZero(d.getHours());
    var SHourutc = padZero(d.getUTCHours());
    var SMins = padZero(d.getMinutes());
    var SMinsutc = padZero(d.getUTCMinutes());
    var SSecs = padZero(d.getSeconds());
    var SSecsutc = padZero(d.getUTCSeconds());
    var SMlscutc = padDoubleZero(d.getUTCMilliseconds());
    var uOhr = padZero(Math.floor(Math.abs(utcf) / 60));
    var uOmn = padZero(Math.abs(utcf) - Math.floor(Math.abs(utcf) / 60) * 60);
    var oFsg = utcf < 0 ? '-' : '+';

    var datestring = ypad + '-' + mpad + '-' + dpad + 'T' + SHour + ':' + SMins + ':' + SSecs + oFsg + uOhr + ':' + uOmn;
    var atomidstring = 'tag:' + urlpr.replace(nureg, '/').replace(dareg, ',' + ypadutc + '-' + mpadutc + '-' + dpadutc + ':$1').replace(loreg, '') + ypadutc + '' + mpadutc + '' + dpadutc + '' + SHourutc + '' + SMinsutc + '' + SSecsutc + '' + SMlscutc;

    return [atomidstring, datestring];
  };

  return exports;
};
