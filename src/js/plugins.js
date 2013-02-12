/*global jQuery, _, List */
(function (win, $) {
  'use strict';

  $(function () {
    $.getJSON('http://grunt-plugin-list.herokuapp.com', function (modules) {
      // only show plugins created after the specified date
      modules = _.filter(modules, function (el) {
        return Date.parse(el.time.created) > new Date('1800-01-01');
      });

      var latestModules = _.sortBy(modules, function (el) {
        return -Date.parse(el.time.created);
      }).splice(0, 5);

      var allModules = _.sortBy(modules, function (el) {
        // removing `grunt-` since some plugins don't contain it
        return el.name.replace('grunt-', '');
      });

      var latestTpl = _.template($('#plugins-latest-template').html(), {
        modules: latestModules
      });

      var allTpl = _.template($('#plugins-all-template').html(), {
        modules: allModules
      });

      $('#loading').hide();
      $('#plugins-latest').append(latestTpl);
      $('#plugins-all').append(allTpl);

      var list = new List('plugins-all', {
        valueNames: [
          'title',
          'desc',
          'author',
          'modified'
        ],
        page: 9999,
        searchClass: 'search-query'
      });

      $('.search-query').removeProp('disabled').focus()
      .on('submit', false)
      .on('keyup paste', function () {
        list.search($(this).val());
      });

      $('#plugins-all .modified time').timeago();

      $('.dropdown').on('click', 'ul a',function () {
        var text = $(this).text();
        var sortDesc = $(this).data('sort-desc');
        var lastSortTitle = $('.dropdown-toggle .choice').text();
        var sortInverse = lastSortTitle === text ? $(this).data('sort-inverse') : false;
        var isAsc = sortInverse ? sortDesc : !sortDesc;

        $(this).data('sort-inverse', !sortInverse);
        $(this).closest('.dropdown').find('.choice').text(text);
        list.sort(text.toLowerCase(), { asc: isAsc });
      });
    });
  });
})(window, jQuery);
