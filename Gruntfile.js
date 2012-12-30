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
        src: 'dist/main.js'
      }
    },
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('build-redirects', 'Build redirect html files.', function() {
    var redirects = grunt.file.readYAML('redirects.yml');
    Object.keys(redirects).forEach(function(path) {
      var url = redirects[path];
      grunt.log.write('Creating redirect for gruntjs.com/' + path + '...');
      grunt.file.copy('tmpl/redirect.tmpl', path + '/index.html', {
        process: function(src) {
          return grunt.template.process(src, {data: {url: url}});
        }
      });
      grunt.log.ok();
    });
  });

  // Default task.
  grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'build-redirects']);

};
