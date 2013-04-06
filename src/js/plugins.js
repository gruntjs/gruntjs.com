/*global jQuery, _, List */
(function (win, $) {
  'use strict';

  $(function () {
    // previous url: http://grunt-plugin-list.herokuapp.com
    $.getJSON('/plugin-list', function (modules) {
      // remove grunt from the plugin name
      modules = _.map(modules, function (el) {
        el.displayName = el.name.replace('grunt-', '');
        el.isContrib = /^contrib/.test(el.displayName);
        if (!el.author) {
          // TODO: update this, temporary way to sort out no author names
          el.author = {};
          el.author.name = 'zzzz';
        }
        return el;
      });

      // filter out contrib plugins not created by the Grunt Team
      modules = _.filter(modules, function (el) {
        return el.isContrib ? el.author && el.author.name === 'Grunt Team' : true;
      });

      var $contribCheck = $('#contrib-top'),
        $pluginsTemplate = $('#plugins-all-template'),
        $pluginsContrib = $('#plugins-contrib'),
        $searchQuery = $('.search-query');

      var contribModules = _.filter(modules, function (el) {
        return !!(/^grunt-contrib/.test(el.name));
      });

      var allModules = _.sortBy(modules, function (el) {
        return el.name;
      });

      var contribTpl = _.template($pluginsTemplate.html(), {
        modules: contribModules
      });

      var allTpl = _.template($pluginsTemplate.html(), {
        modules: allModules
      });

      $('#loading').hide();

      $searchQuery.val('');

      $pluginsContrib.append(contribTpl);
      $('#plugins-all').append(allTpl);
      var list2 = new List('plugins-contrib', {
        valueNames: [
          'title',
          'desc',
          'author',
          'modified',
          'gruntVersion'
        ],
        page: 9999,
        searchClass: 'search-query'
      });

      var list = new List('plugins-all', {
        valueNames: [
          'title',
          'desc',
          'author',
          'modified',
          'gruntVersion'
        ],
        page: 9999,
        searchClass: 'search-query'
      });

      var searchTimer;
      var baseURL = document.URL.split('/').slice(0,4).join('/');
      $searchQuery.removeProp('disabled').focus()
      .on('submit', false)
      .on('keyup paste', function () {
        // disable contrib first, if searching
        if ($contribCheck.is(':checked')) $contribCheck.trigger('click');
        var query = $(this).val();
        list.search( query );
        // wait .75 seconds to update location so it's not every keystroke
        clearTimeout(searchTimer);
        searchTimer = setTimeout(function () {
          if (history && history.pushState) history.pushState({ page: query }, query, baseURL+'/'+query );
        },750);
      });
      // update query value on popstate
      $(window).on('popstate', function () {
        if(history.state) {
          $searchQuery.val(history.state.page);
        } else {
          $searchQuery.val('');
        }
        // execute the search
        list.search( $searchQuery.val() );
      });

      $('#plugins-all .modified time, #plugins-contrib .modified time').timeago();

      $contribCheck.change(function() {
        if ($contribCheck.is(':checked')) {
          $pluginsContrib.fadeIn();
          list.filter(function (el) {
            return !(/^contrib/.test(el.values().title));
          });
        } else {
          $pluginsContrib.fadeOut();
          list.filter();
        }

      }).trigger('click');

      $('.dropdown').on('click', 'ul a',function () {
        var text = $(this).text();
        var sortDesc = $(this).data('sort-desc');
        var lastSortTitle = $('.dropdown-toggle .choice').text();
        var sortInverse = lastSortTitle === text ? $(this).data('sort-inverse') : false;
        var isAsc = sortInverse ? sortDesc : !sortDesc;

        $(this).data('sort-inverse', !sortInverse);
        var drop = $(this).closest('.dropdown');
        drop.find('.choice').text(text);
        drop.removeClass('open');

        if (text === "Version") {
          text = "gruntVersion";
        } else {
          text = text.toLowerCase();
        }
        list.sort(text, { asc: isAsc });
        list2.sort(text, { asc: isAsc });

        return false;
      });

      // url plugin search, search grunt plugins using /plugins/[query]
      var url = document.URL.split('/');
      if (url[4] && url[4].length > 1) {
        $contribCheck.trigger('click');
        $searchQuery.val(url[4]).keyup();
      }
    });
  });
})(window, jQuery);
