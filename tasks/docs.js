/*
 * grunt api docs
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 grunt contributors
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
  'use strict';

  grunt.registerTask('docs', 'Compile Grunt Docs to HTML', function() {
    // Prepare the marked markdown parser.
    var marked = require('marked');
    // Set default marked options
    marked.setOptions({
      gfm: true,
      pedantic: false,
      sanitize: true,
      // convert .md links to .html
      convertLinks: true,
      // callback for code highlighter
      highlight: function(code) {
        return code;
      }
    });

    // Contrib index
    grunt.file.copy('tmpl/docs-index.md', 'build/docs/index.html', {
      process: function(src) {
        var layout = grunt.file.read('tmpl/layout.tmpl');

        var processed = marked( grunt.template.process(src) );

        return grunt.template.process(layout, {data: {content: processed}});
      }
    });


    // Contrib Docs

    var sections = [];

    var base = 'node_modules/grunt-contrib/node_modules/';
    var names = grunt.file.expand({cwd: base}, 'grunt-contrib-*');
    names = names.map(function(name) { return name.replace(/.*-([^\-]+)\//, '$1'); });

    names.forEach(function(name) {
      var section = {name: name};
      sections.push(section);

      var src = base + 'grunt-contrib-' + name + '/README.md';
      var dest = 'build/docs/contrib/' + name + '.html';
      grunt.file.copy(src, dest, {
        process: function(src) {
          section.description = src.split('\n')[1].replace(/^>\s+/, '');
          return marked(src);
        }
      });
    });
    grunt.log.ok('Created ' + names.length + ' files.');

    // Create contrib index
    grunt.file.copy('tmpl/contrib-index.md', 'build/docs/contrib/index.html', {
      process: function(src) {
        var layout = grunt.file.read('tmpl/layout.tmpl');

        var processed = marked( grunt.template.process(src, {data: {sections: sections}}) );

        return grunt.template.process(layout, {data: {content: processed}});
      }
    });
    grunt.log.ok('Created index.');



    // API Docs
    var sections = [];

    var base = 'node_modules/grunt/docs/';
    var names = grunt.file.expand({cwd: base}, ['api_*.md', '!*utils*']);
    names = names.map(function(name) { return name.replace(/.*_([^.]+)\.md/, '$1'); });

    // Generate Sections
    names.forEach(function(name) {
      var section = {name: name};
      sections.push(section);
    });

    names.forEach(function(name) {
      var section = {name: name};
      var src = base + 'api_' + name + '.md';
      var dest = 'build/docs/api/' + name + '.html';
      grunt.file.copy(src, dest, {
        process: function(src) {
          section.description = src.split('\n')[1].replace(/^>\s+/, '');

          var layout = grunt.file.read('tmpl/layout.tmpl');
          var sidebarTmpl = grunt.file.read('tmpl/api-index.md');

          var processed = marked(src);
          var sidebar = marked( grunt.template.process(sidebarTmpl, {data: {sections: sections}}) );

          return grunt.template.process(layout, {data: {content: processed, sidebar: sidebar}});
        }
      });
    });
    grunt.log.ok('Created ' + names.length + ' files.');

    grunt.file.copy('tmpl/api-index.md', 'build/docs/api/index.html', {
      process: function(src) {
        var layout = grunt.file.read('tmpl/layout.tmpl');

        var processed = marked( grunt.template.process(src, {data: {sections: sections}}) );

        return grunt.template.process(layout, {data: {content: processed}});
      }
    });
    grunt.log.ok('Created index.');
  });
};