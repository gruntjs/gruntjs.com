/*global jQuery, _, List */
(function (win, $) {
  'use strict';

  $.fn.dataTableExt.sErrMode = 'throw';

  var url = document.URL.split('/');
  var initSearch = '';
  if (url[4] && url[4].length > 1) {
    initSearch = url[4];
  }

  $('#plugins-all').dataTable({
    'ajax': '/plugin-list.json',
    'bStateSave': true,
    'oSearch': {"sSearch": initSearch},
    'bAutoWidth': false,
    "sDom": '<"top"ilfp<"clear">>',
    "sPaginationType": "bootstrap",
    "oLanguage": {
      "sLengthMenu": "_MENU_ records per page"
    },
    'bLengthChange': false,
    'iDisplayLength': 100,
    'aaSorting': [
      [2, 'desc']
    ],
    'columns': [
      { 'data': 'name',
        'bSearchable': true,
        'sDefaultContent': '',
        'mRender': function (data, type, full) {
          var name = data.replace('grunt-', '');
          var isContrib = full.author === 'Grunt Team' && data.indexOf('grunt-contrib-') === 0;
          var author = (full.author && full.author.length > 0) ? ('by ' + full.author) : '';

          var tmpl = '';
          tmpl += '<a class="plugin ' + (isContrib ? 'contrib' : '') + '" href="https://npmjs.org/package/' + data + '">';
          tmpl += '<span class="name-description">';
          tmpl += '<span class="title">' + name + '</span>';
          tmpl += '<span class="author">' + author + '</span>';
          tmpl += '<span class="desc">' + full.ds + '</span>';
          tmpl += '</span>';
          tmpl += '</a>';

          return tmpl
        }
      },
      { 'data': 'time.modified',
        'bSearchable': false,
        'sType': 'dateString',
        'sDefaultContent': '',
        'mRender': function (data, type, full) {
          var tmpl = '';
          tmpl += '<span title="' + data + '"> ' + $.timeago(data) + '</span>';

          return tmpl
        },
        'asSorting': [ "desc" ]
      },
      { 'data': 'dw',
        'sClass': 'dw',
        'sType': 'numeric',
        'bSearchable': false,
        'sDefaultContent': '',
        'asSorting': [ "desc" ]
      }
    ]
  });

})(window, jQuery);
