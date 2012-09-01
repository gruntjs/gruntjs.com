/*global $, _ */

// Required by jquery-ajax-localstorage-cache
var Modernizr = {};
Modernizr['localstorage'] = function() {
	try {
		localStorage.setItem(mod, mod);
		localStorage.removeItem(mod);
		return true;
	} catch(e) {
		return false;
	}
};

jQuery(function( $ ) {
	'use strict';

	$.ajaxSetup({
		type: 'GET',
		dataType: 'jsonp',
		// Caches everything in localStorage ftw!
		localCache: true,
		cacheTTL: 24 * 7
	});

	function process( data, keyword, cb ) {
		var moduleList = JSON.parse( localStorage.getItem( 'npm-' + keyword ) ) || [];
		var urls = $.map( data.rows, function( el ) {
			var moduleName = el.key[1];
			var moduleExists = !!$.grep( moduleList, function( el ) {
				return el.name === moduleName;
			}).length;

			if ( !moduleExists ) {
				return 'http://isaacs.iriscouch.com/registry/' + moduleName + '?callback=?';
			}
		});
		var ajaxQueue = urls.length;

		if ( urls.length ) {
			$.each( urls, function( i, url ) {
				$.ajax({
					url: url,
					success: function( data ) {
						moduleList.push( data );

						if ( --ajaxQueue === 0 ) {
							cb( moduleList );
						}
					}
				});
			});
		} else {
			cb( moduleList );
		}
	}

	function fetchModuleList( keyword, cb ) {
		var url = 'http://isaacs.iriscouch.com/registry/_design/app/_view/byKeyword?startkey=[%22' +
			keyword + '%22]&endkey=[%22' + keyword + '%22,{}]&group_level=3&callback=?';

		$.ajax({
			url: url,
			cacheTTL: 24,
			success: function( data ) {
				process( data, keyword, cb );
			}
		});
	}

	fetchModuleList( 'gruntplugin', function( modules ) {
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
