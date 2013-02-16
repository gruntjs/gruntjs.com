/*
 * grunt docs
 * http://gruntjs.com/
 *
 * Copyright (c) 2013 grunt contributors
 * Licensed under the MIT license.
 */

var Path = require('path'),
  fs = require('fs'),
  exec = require('child_process').exec,
  jade = require('jade'),
  highlighter = require('highlight.js');

var marked = require('marked');
// Set default marked options
marked.setOptions({
  gfm:true,
  anchors:true,
  base:"/",
  pedantic:false,
  sanitize:true,
  // callback for code highlighter
  highlight:function (code) {
    return highlighter.highlight('javascript', code).value;
  }
});

module.exports = function (grunt) {
  'use strict';


  /**
   * Custom task to generate grunt documentation
   */
  grunt.registerTask('blog', 'Compile Grunt Blog', function () {
    var done = this.async();
    grunt.log.ok('Generating news...');

    var names,
      shortList = [],
      base = 'tmp/wiki/',
      files = grunt.file.expand({cwd:base}, ['Blog-*.md']);


    names = files.map(function (name) {
      return name.substring(5, name.length - 3);
    });

    files.forEach(function (file, i) {

      var name = names[i],
        postTitle = name.substring(10, name.length).replace(/-/g, ' '),
        postDate = name.substring(0, 10),
        destName = name.toLowerCase(),
        src = base + file,
        dest = 'build/blog/' + destName + '.html';

      grunt.file.copy(src, dest, {
        process:function (src) {
          try {
            var file = 'src/tmpl/docs.jade',
              templateData = {
                page:'news',
                url: destName,
                title:postTitle,
                postDate: postDate,
                content:marked(src)
              };
            shortList.push(templateData);

            return jade.compile(grunt.file.read(file), {filename:file})(templateData);
          } catch (e) {
            grunt.log.error(e);
            grunt.fail.warn('Jade failed to compile.');
          }
        }
      });
    });

    try {
      var src = 'src/tmpl/blog.jade',
        templateData = {
        page:'blog',
        title:"Latest Grunt News",
        content:shortList,
        sidebars:[]
      };
      grunt.file.write(
        'build/blog/index.html',
        jade.compile(grunt.file.read(src), {filename:src})(templateData));
    } catch (e) {
      grunt.log.error(e);
      grunt.fail.warn('Jade failed to compile.');
    }



    grunt.log.ok('Created ' + names.length + ' files.');
    done(true);
  });
};
