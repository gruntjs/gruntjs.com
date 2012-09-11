module.exports = function(grunt) {
	'use strict';

  grunt.initConfig({
    concat: {
      'dist/main.js' : [
        'js/vendor/jquery-1.8.1.js',
        'js/vendor/jquery-ajax-localstorage-cache.js',
        'js/vendor/lodash-0.6.1.js',
        'js/vendor/jquery.timeago.js',
        'js/vendor/list.min.js',
        'js/main.js'
      ]
    },
    min: {
      'dist/main.js' : ['dist/main.js']
    },
    lint: {
      files: ['js/*.js']
    }
  });

  grunt.loadTasks('tasks');

  grunt.registerTask('default', 'lint concat min');
};
