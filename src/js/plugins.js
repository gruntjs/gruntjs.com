/*global jQuery, _, List */
(function (win, $) {
  'use strict';

  $(function () {
    $.getJSON('http://grunt-plugin-list.herokuapp.com', function (modules) {
      // remove grunt from the plugin name
      modules = _.map(modules, function (el) {
        el.name = el.name.replace('grunt-', '');
        return el;
      });

      // only show plugins created after the specified date
      modules = _.filter(modules, function (el) {
        return Date.parse(el.time.created) > new Date('1800-01-01');
      });

      // filter out contrib plugins not created by the Grunt Team
      modules = _.filter(modules, function (el) {
        return /^contrib-/.test(el.name) ? el.author && el.author.name === 'Grunt Team' : true;
      });

      var latestModules = _.sortBy(modules, function (el) {
        return -Date.parse(el.time.created);
      }).splice(0, 5);

      var allModules = _.sortBy(modules, function (el) {
        return el.name;
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
        $('.contrib-toggle .btn:first').click();
        list.search($(this).val());
      });

      $('#plugins-all .modified time').timeago();

      $('.contrib-toggle .btn').click(function () {
        $(this).addClass('selected').siblings().removeClass('selected');

        if ($(this).text() === 'All Plugins') {
          list.filter();
        } else {
          list.filter(function (el) {
            return /^contrib-/.test(el.values().title);
          });
        }
      }).last().click();

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
