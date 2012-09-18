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

  grunt.registerTask('docs-contrib', 'Generate contrib plugin docs.', function() {
    var sections = [];

    var base = 'node_modules/grunt-contrib/node_modules/';
    var names = grunt.file.expand({cwd: base}, 'grunt-contrib-*');
    names = names.map(function(name) { return name.replace(/.*-([^\-]+)\//, '$1'); });

    names.forEach(function(name) {
      var section = {name: name};
      sections.push(section);

      var src = base + 'grunt-contrib-' + name + '/README.md';
      var dest = 'build/docs/contrib/' + name + '.md';
      grunt.file.copy(src, dest, {
        process: function(src) {
          section.description = src.split('\n')[1].replace(/^>\s+/, '');
          return src;
        }
      });
    });
    grunt.log.ok('Created ' + names.length + ' files.');

    grunt.file.copy('tmpl/contrib-index.md', 'build/docs/contrib/index.md', {
      process: function(src) {
        return grunt.template.process(src, {data: {sections: sections}});
      }
    });
    grunt.log.ok('Created index.');
  });

  grunt.registerTask('docs-api', 'Generate grunt API docs.', function() {
    var sections = [];

    var base = 'node_modules/grunt/docs/';
    var names = grunt.file.expand({cwd: base}, ['api_*.md', '!*utils*']);
    names = names.map(function(name) { return name.replace(/.*_([^.]+)\.md/, '$1'); });

    names.forEach(function(name) {
      var section = {name: name};
      sections.push(section);

      var src = base + 'api_' + name + '.md';
      var dest = 'build/docs/api/' + name + '.md';
      grunt.file.copy(src, dest, {
        process: function(src) {
          section.description = src.split('\n')[4];
          return src;
        }
      });
    });
    grunt.log.ok('Created ' + names.length + ' files.');

    grunt.file.copy('tmpl/api-index.md', 'build/docs/api/index.md', {
      process: function(src) {
        return grunt.template.process(src, {data: {sections: sections}});
      }
    });
    grunt.log.ok('Created index.');
  });

};
