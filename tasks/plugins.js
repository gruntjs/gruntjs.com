/*
 * grunt plugins page
 * http://gruntjs.com/
 *
 * Copyright (c) 2013 grunt contributors
 * Licensed under the MIT license.
 */

module.exports = function (grunt) {
  'use strict';

  /**
   * Custom task to generate the plugins page
   */
  grunt.registerTask('plugins', 'Compile Grunt Plugins Page', function () {
    var jade = require('jade'),
      marked = require('marked');

    // Set default marked options
    marked.setOptions({
      gfm:true,
      base:'/',
      sanitize:false
    });

    grunt.log.ok('Generating plugins page...');

    var file = 'src/tmpl/plugins.jade';
    // Compile output with Jade.
    var output = jade.compile(grunt.file.read(file), {filename:file})({
      page: 'plugins',
      title: 'Plugins',
      content: marked(grunt.file.read('tmp/wiki/Grunt-Plugins.md'))
    });
    grunt.file.write('build/plugins.html', output);
  });
};
