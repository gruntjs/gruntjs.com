'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      files: ['js/*.js']
    },
    concat: {
      main: {
        dest: 'dist/main.js',
        src: [
          'js/vendor/jquery.js',
          'js/vendor/jquery-ajax-localstorage-cache.js',
          'js/vendor/lodash.js',
          'js/vendor/jquery.timeago.js',
          'js/vendor/list.min.js',
          'js/main.js',
        ]
      }
    },
    uglify: {
      main: {
        dest: 'dist/main.js',
        src: '<%= concat.main.dest %>'
      }
    },
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task.
  grunt.registerTask('default', ['jshint', 'concat', 'uglify']);

};
