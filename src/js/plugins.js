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
        var name = data.replace('grunt-', '');
        var isContrib = full.a === 'Grunt Team' && data.indexOf('grunt-contrib-') === 0;
        var author = (full.a && full.a.length > 0) ? ('by ' + full.a) : '';

        var tmpl = '';
        tmpl += '<a class="plugin ' + (isContrib ? 'contrib' : '') + '" href="https://www.npmjs.com/package/' + data + '">';
        tmpl += '<span class="name-description">';
        tmpl += '<span class="title">' + name + '</span>';
        tmpl += '<span class="author">' + author + '</span>';
        tmpl += '<span class="desc">' + full.ds + '</span>';
        tmpl += '</span>';
        tmpl += '</a>';

        return tmpl;
      }
    },
    {
      'data': 'dl',
      'sClass': 'dl',
      'sType': 'numeric',
      'bSearchable': false,
      'sDefaultContent': '',
      'asSorting': [ 'desc' ]
    }]
  });

})(jQuery);
