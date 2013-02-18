/*global jQuery, _, List */
(function (win, $) {
  'use strict';

  $(function () {
    // previous url: http://grunt-plugin-list.herokuapp.com
    $.getJSON('/plugin-list', function (modules) {
      // remove grunt from the plugin name
      modules = _.map(modules, function (el) {
        el.displayName = el.name.replace('grunt-', '');
        el.isContrib = /^contrib-/.test(el.displayName);
        return el;
      });

      // only show plugins created after the specified date
      modules = _.filter(modules, function (el) {
        return Date.parse(el.time.created) > new Date('1800-01-01');
      });

      // filter out contrib plugins not created by the Grunt Team
      modules = _.filter(modules, function (el) {
        return el.isContrib ? el.author && el.author.name === 'Grunt Team' : true;
      });

      var contribModules = _.filter(modules, function (el) {
        return !!(/^grunt-contrib-/.test(el.name));
      });

      var allModules = _.sortBy(modules, function (el) {
        return el.name;
      });

      var contribTpl = _.template($('#plugins-all-template').html(), {
        modules: contribModules
      });

      var allTpl = _.template($('#plugins-all-template').html(), {
        modules: allModules
      });

      $('#loading').hide();
      var $contribCheck = $('#contrib-top'),
          $pluginsContrib = $('#plugins-contrib'),
          $searchQuery = $('.search-query');

      $pluginsContrib.append(contribTpl);
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

      $searchQuery.removeProp('disabled').focus()
      .on('submit', false)
      .on('keyup paste', function () {
        if ($contribCheck.is(':checked')) $contribCheck.trigger('click');
        $('.contrib-toggle .btn:first').click();
        list.search($(this).val());
      });

      $('#plugins-all .modified time, #plugins-contrib .modified time').timeago();

      $contribCheck.change(function() {
        if ($contribCheck.is(':checked')) {
          $pluginsContrib.fadeIn();
          list.filter(function (el) {
            return !(/^contrib-/.test(el.values().title));
          });
        } else {
          $pluginsContrib.fadeOut();
          list.filter();
        }

      }).trigger('click');

      $('.dropdown').on('click', 'ul a',function () {
        if ($contribCheck.is(':checked')) $contribCheck.trigger('click');
        var text = $(this).text();
        var sortDesc = $(this).data('sort-desc');
        var lastSortTitle = $('.dropdown-toggle .choice').text();
        var sortInverse = lastSortTitle === text ? $(this).data('sort-inverse') : false;
        var isAsc = sortInverse ? sortDesc : !sortDesc;

        $(this).data('sort-inverse', !sortInverse);
        $(this).closest('.dropdown').find('.choice').text(text);
        list.sort(text.toLowerCase(), { asc: isAsc });
      });

      // url plugin search, search grunt plugins using /plugins/[query]
      var url = document.URL,
        shortUrl= url.substring(url.lastIndexOf("/") + 1, url.length);
      if (shortUrl.length > 0 && shortUrl.indexOf("plugins") !== 0) $searchQuery.val(shortUrl).focus();

    });
  });
})(window, jQuery);
