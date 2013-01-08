/*global localStorage, _, List */
(function( win, $ ) {
	'use strict';

	// Required by jquery-ajax-localstorage-cache
	win.Modernizr = {};
	/*jshint sub:true */
	win.Modernizr['localstorage'] = function() {
		var mod = 'mod';
		try {
			localStorage.setItem(mod, mod);
			localStorage.removeItem(mod);
			return true;
		} catch(e) {
			return false;
		}
	};


	function fetchModuleList(cb ) {
		var url = 'http://grunt-plugin-list.herokuapp.com/';

		$.ajax({
			url: url,
			dataType: 'json',
			cacheTTL: 24,
			success: function( data ) {
				cb(data);
			}
		});
	}

	$(function() {

		fetchModuleList(function( modules ) {
			// Only show plugins created after the specified date
			modules = _.filter( modules, function( el ) {
				return Date.parse( el.time.created ) > new Date('1800-01-01');
			});

			var latestModules = _.sortBy( modules, function( el ) {
				return -Date.parse( el.time.created );
			}).splice(0, 5);

			var allModules = _.sortBy( modules, function( el ) {
				// Remove the prefix, since not all plugins has it
				return el.name.replace('grunt-', '');
			});

			var latestTpl = _.template( $('#plugins-latest-template').html(), {
				modules: latestModules
			});

			var allTpl = _.template( $('#plugins-all-template').html(), {
				modules: allModules
			});

			$('#loading').remove();
			$('#plugins-latest').append( latestTpl );
			$('#plugins-all').append( allTpl ).find('.search').show();

			new List('plugins-all', {
				valueNames: [
					'name',
					'desc',
					'author',
					'modified'
				]
			});

			$('.modified time').timeago();
		});
	});
})( window, jQuery );
