'use strict';

module.exports = function(grunt) {
  // grunt.loadNpmTasks('grunt-contrib/node_modules/grunt-contrib-clean');

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
        es5: true,
      }
    },
  });

  // Default task.
  grunt.registerTask('default', ['jshint', 'clean', 'docs']);
  grunt.registerTask('docs', ['docs-contrib', 'docs-api']);

  grunt.registerTask('clean', 'Clean build directory.', function() {
    // todo: use clean task
    if (grunt.file.exists('build')) { grunt.file.delete('build'); }
  });

  grunt.registerTask('docs-contrib', 'Extract contrib docs.', function() {
    var contribs = grunt.file.expand('node_modules/grunt-contrib/node_modules/grunt-contrib-*');
    contribs.forEach(function(dirpath) {
      var name = dirpath.replace(/.*-([^\-]+)\//, '$1');
      var src = dirpath + '/README.md';
      var dest = 'build/docs/contrib/' + name + '.md';
      grunt.log.write('Creating file "' + dest + '"...');
      grunt.file.copy(src, dest);
      grunt.log.ok();
    });
  });

  grunt.registerTask('docs-api', 'Extract grunt API docs.', function() {
    var apis = grunt.file.expand('node_modules/grunt/docs/api_*.md');
    apis.forEach(function(src) {
      var name = src.replace(/.*_([^.]+)\.md/, '$1');
      var dest = 'build/docs/api/' + name + '.md';
      grunt.log.write('Creating file "' + dest + '"...');
      grunt.file.copy(src, dest);
      grunt.log.ok();
    });
  });

};
