/*
 * grunt plugins page
 * http://gruntjs.com/
 *
 * Copyright (c) 2013 grunt contributors
 * Licensed under the MIT license.
 */

module.exports = function (grunt) {
  'use strict';

  var jade = require('jade'),
    marked = require('marked');

  /**
   * Custom task to generate the plugins page
   */
  grunt.registerTask('plugins', 'Compile Grunt Plugins Page', function () {
    var pluginTpl = 'src/tmpl/plugins.jade';

    var base = 'node_modules/grunt-docs/';

    // Set default marked options
    marked.setOptions({
      gfm:true,
      base:'/',
      sanitize:false
    });

    grunt.log.ok('Generating plugins page...');
    var output = jade.compile(grunt.file.read(pluginTpl), {filename:pluginTpl})({
      page: 'plugins',
      title: 'Plugins',
      content: marked(grunt.file.read(base + 'Grunt-Plugins.md'))
    });
    grunt.file.write('build/plugins.html', output);
  });

  grunt.registerTask('downloadPlugins', 'Download Plugin Information', function () {
      var done = this.async();
      var cache = true;

      var plugins = require('../grunt-plugins');
      plugins.download({ cache: cache }, function() {
        done();
      });
  });
};
