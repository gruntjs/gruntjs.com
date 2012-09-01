module.exports = function(grunt) {
	'use strict';

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-webpack');

  grunt.initConfig({
     meta: {
      docsindex: '<!DOCTYPE html><html><head>' +
      '<script type="text/javascript" charset="utf-8" ' +
      'src="asserts/<%= docsStats.hash %>.js"></script>' +
      '</head><body></body></html>'
    },
    webpack: {
      docs: {
        src: "docs/lib/docs.js",
        publicPrefix: "asserts/",
        statsTarget: "docsStats",
        dest: "docs/asserts/[hash].js"
      }
    },
    clean: ['docs/asserts/**/*', 'docs/index.html'],
    concat: {
      'dist/main.js' : [
        'js/vendor/jquery-1.8.1.js',
        'js/vendor/jquery-ajax-localstorage-cache.js',
        'js/vendor/lodash-0.6.1.js',
        'js/vendor/jquery.timeago.js',
        'js/vendor/list.min.js',
        'js/main.js'
      ],
      'docs/index.html': [
        '<banner:meta.docsindex>'
      ]
    },
    min: {
      'dist/main.js' : ['dist/main.js']
    },
    lint: {
      files: ['js/*.js']
    }
  });

  grunt.registerTask('default', ['lint', 'clean', 'webpack', 'concat', 'min']);
};
