/* jshint browser:true, jquery:true, node:false */

(function ($) {
  'use strict';

  $.fn.dataTableExt.sErrMode = 'throw';

  var url = document.URL.split('/');
  var initSearch = '';
  if (url[4] && url[4].length > 1) {
    initSearch = url[4];
  }

  $('#plugins-all').dataTable({
    // source
    'ajax': '/plugin-list.json',
    // save search with a cookie
    'bStateSave': true,
    // search features
    'oSearch': {'sSearch': initSearch},
    'bAutoWidth': false,
    'sDom': '<"top"ilfp<"clear">>',
    'sPaginationType': 'bootstrap',
    'oLanguage': {
      'sLengthMenu': '_MENU_ records per page'
    },
    'bLengthChange': false,
    'iDisplayLength': 100,
    'aaSorting': [
      [1, 'desc']
    ],
    'columns': [{
      'data': 'name',
      'bSearchable': true,
      'sDefaultContent': '',
      'mRender': function (data, type, full) {
        var pkg = full.package;
        var isContrib = pkg.name.indexOf('grunt-contrib-') === 0;
        var author = pkg.author ? 'by ' + pkg.author.name : '';
        var tmpl = '';
        tmpl += '<a class="plugin ' + (isContrib ? 'contrib' : '') + '" href="' + pkg.links.npm + '">';
        tmpl += '<span class="name-description">';
        tmpl += '<span class="title">' + pkg.name + '</span>';
        tmpl += '<span class="author">' + author + '</span>';
        tmpl += '<span class="desc">' + pkg.description + '</span>';
        tmpl += '</span>';
        tmpl += '</a>';

        return tmpl;
      }
    },
    {
      'data': 'name',
      'bSearchable': true,
      'sDefaultContent': '',
      'mRender': function (data, type, full) {
        var score = full.score;
        var tmpl = '<span class="score">' + Math.round(score.detail.popularity * 100, 2) + '</span>';
        return tmpl;
      }
    }]
  });

})(jQuery);
