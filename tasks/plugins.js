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
      content: marked(grunt.file.read('tmp/wiki/Grunt-Plugins.md'))
    });
    grunt.file.write('build/plugins.html', output);
  });
};
