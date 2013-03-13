'use strict';

exports.init = function (/*grunt*/) {
  var exports = {};

  exports.formatDate = function (postDate) {
    var dateFormat = postDate.split('-'),
      monthNames = [ 'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December' ];
    return monthNames[parseInt(dateFormat[1], 10) - 1] + ' ' + dateFormat[2] + ', ' + dateFormat[0];
  };

  exports.atomIDnTimeStampChurner = function (urlst, postDate) {
    /* Atom id and timestamp generator by hesido.com */
    /* Free to use in any condition, modify, distribute */
    function padzero(toPad) {
      return (toPad + '').replace(/(^.$)/, '0$1');
    }

    function paddoublezero(toPad) {
      return (toPad + '').replace(/(^.$)/, '0$1').replace(/(^..$)/, '0$1');
    }

    if (!urlst || urlst == null || urlst == "") return false

    var htreg = /^http:\/\//,
      nureg = /#/g,
      dareg = /(\/)/,
      loreg = /([^\/]*[^\/]$)/,
      urlpr = urlst.replace(htreg, '');

    if (urlpr.indexOf('/') == -1) urlpr += '/';

    var d = new Date(postDate);

    var utcf = d.getTimezoneOffset(),
      ypad = d.getFullYear(),
      ypadutc = d.getUTCFullYear(),
      mpad = padzero(d.getMonth() + 1),
      mpadutc = padzero(d.getUTCMonth() + 1),
      dpad = padzero(d.getDate()),
      dpadutc = padzero(d.getUTCDate()),
      SHour = padzero(d.getHours()),
      SHourutc = padzero(d.getUTCHours()),
      SMins = padzero(d.getMinutes()),
      SMinsutc = padzero(d.getUTCMinutes()),
      SSecs = padzero(d.getSeconds()),
      SSecsutc = padzero(d.getUTCSeconds()),
      SMlsc = paddoublezero(d.getMilliseconds()),
      SMlscutc = paddoublezero(d.getUTCMilliseconds()),
      uOhr = padzero(Math.floor(Math.abs(utcf) / 60)),
      uOmn = padzero(Math.abs(utcf) - Math.floor(Math.abs(utcf) / 60) * 60),
      oFsg = (utcf < 0) ? '-' : '+';

    var datestring = ypad + '-' + mpad + '-' + dpad + 'T' + SHour + ':' + SMins + ':' + SSecs + oFsg + uOhr + ':' + uOmn;
    var atomidstring = "tag:" + urlpr.replace(nureg, '/').replace(dareg, ',' + ypadutc + '-' + mpadutc + '-' + dpadutc + ':$1').replace(loreg, '') + ypadutc + '' + mpadutc + '' + dpadutc + '' + SHourutc + '' + SMinsutc + '' + SSecsutc + '' + SMlscutc;

    return [atomidstring, datestring];
  };

  return exports;
};



