'use strict';

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Load local tasks
  grunt.loadTasks('tasks'); // getWiki, docs tasks

  // Project configuration.
  grunt.initConfig({
    // clean directories
    clean: {
      build: ['build/'],
      tmp: ['tmp/']
    },
    // compile less -> css
    less: {
      development: {
        options: {
          paths: ["build/css"]
        },
        files: {
          "build/css/main.css": "src/less/main.less",
          "build/css/bootstrap.css": "src/less/bootstrap.less"
        }
      },
      production: {
        options: {
          paths: ["build/css"],
          yuicompress: true
        },
        files: {
          "build/css/main.css": "src/less/main.less",
          "build/css/bootstrap.css": "src/less/bootstrap.less"
        }
      }
    },
    // watch
    watch: {
      less: {
        files: 'src/less/*.less',
        tasks: ['less:development']
      }
    },
    copy: {
      assets: {
        files: [
          {expand: true, cwd: 'src/', src: ['js/**', 'img/**', 'fonts/**'], dest: 'build/'}
        ]
      },
      root: {
        files: [
          {expand: true, cwd: 'src/', src: ['*'], dest: 'build/', filter: 'isFile'}
        ]
      }
    }
  });

  grunt.registerTask('build', ['clean', 'copy', 'docs']);

  // Default task.
  grunt.registerTask('default', ['build', 'less:production']);
  grunt.registerTask('dev', ['build', 'less:development', 'watch']);
  //grunt.registerTask('docs', ['docs-contrib', 'docs-api', 'docs-index']);


};
