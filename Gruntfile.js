'use strict';

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Load local tasks
  grunt.loadTasks('tasks'); // getWiki, docs tasks

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: ['Gruntfile.js'],
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        node: true,
        es5: true
      }
    },
    clean: {
      build: ['build/'],
      tmp: ['tmp/']
    }
  });


  // Default task.
  grunt.registerTask('default', ['jshint', 'clean', 'docs']);
  grunt.registerTask('server', ['serve']);
  //grunt.registerTask('docs', ['docs-contrib', 'docs-api', 'docs-index']);


};
