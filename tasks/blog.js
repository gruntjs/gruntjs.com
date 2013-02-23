/*
 * grunt blog, rss, index pages
 * http://gruntjs.com/
 *
 * Copyright (c) 2013 grunt contributors
 * Licensed under the MIT license.
 */

var fs = require('fs'),
  jade = require('jade'),
  highlighter = require('highlight.js'),
  marked = require('marked');

module.exports = function (grunt) {
  'use strict';

  /**
   * Custom task to generate grunt documentation
   */
  grunt.registerTask('blog', 'Compile Grunt Blog', function () {
    var done = this.async();
    grunt.log.ok('Generating blog...');

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

    var names,
      shortList = [],
      articleList = [],
      base = 'tmp/wiki/',
      files = grunt.file.expand({cwd:base}, ['Blog-*.md']);

    function formatBlogDate(postDate) {
      var postDate = postDate.split('-'),
        monthNames = [ "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December" ];
      return monthNames[parseInt(postDate[1], 10) - 1] + ' ' + postDate[2] + ', ' + postDate[0];
    }

    names = files.map(function (name) {
      return name.substring(5, name.length - 3);
    }).reverse();


    // REVERSE the list, generate short article list
    files.reverse().forEach(function (file, i) {
      var name = names[i],
        postTitle = name.substring(10, name.length).replace(/-/g, ' '),
        postDate = name.substring(0, 10),
        destName = name.toLowerCase();

      articleList.push({
          url: destName,
          title:postTitle,
          postDate: formatBlogDate(postDate)
      });
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
            var file = 'src/tmpl/blog.jade',
              templateData = {
                page:'news',
                singlePost: true,
                url: destName,
                title:postTitle,
                postDate: formatBlogDate(postDate),
                postRawDate: postDate,
                articleList: articleList,
                content:marked(src),
                rawSrc: src
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

    /**
     * Generate the blog page with a list of posts
     */
    grunt.log.ok('Generating blog front page..');
    try {
      var src = 'src/tmpl/blog.jade',
        templateData = {
        page:'blog',
        title:"The Grunt Blog",
        content:shortList,
        articleList: articleList
      };
      grunt.file.write(
        'build/blog.html',
        jade.compile(grunt.file.read(src), {filename:src})(templateData));
    } catch (e) {
      grunt.log.error(e);
      grunt.fail.warn('Jade failed to compile.');
    }


    /**
     * Generate the RSS feed
     */
    grunt.log.ok('Generating rss feed...');

    // remove anchors from RSS setting
    marked.setOptions({
      anchors: false
    });
    // generate the feed items with different 'marked' settings
    shortList.forEach(function(item) {
      item.rssSrc = marked(item.rawSrc);
    });

    try {
      var src = 'src/tmpl/rss.jade',
        templateData = {
          page:'rss',
          posts: shortList
        };
      grunt.file.write(
        'build/atom.xml',
        jade.compile(grunt.file.read(src), {filename:src})(templateData));
    } catch (e) {
      grunt.log.error(e);
      grunt.fail.warn('Jade failed to compile.');
    }


    /**
     * Generate the front page
     */
    grunt.log.ok('Generating the front page...');
    try {
      var src = 'src/tmpl/index.jade',
        templateData = {
          page:'index',
          news: shortList.splice(0,5)
        };
      grunt.file.write(
        'build/index.html',
        jade.compile(grunt.file.read(src), {filename:src})(templateData));
    } catch (e) {
      grunt.log.error(e);
      grunt.fail.warn('Jade failed to compile.');
    }


    grunt.log.ok('Created ' + names.length + ' files.');
    done(true);
  });
};
