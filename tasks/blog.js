/*
 * grunt blog, rss, index pages
 * http://gruntjs.com/
 *
 * Copyright (c) 2013 grunt contributors
 * Licensed under the MIT license.
 */

module.exports = function (grunt) {
  'use strict';

  var jade = require('jade'),
    highlighter = require('highlight.js'),
    marked = require('marked'),
    blog = require('./lib/blog').init(grunt);

  /**
   * Custom task to generate the grunt blog
   */
  grunt.registerTask('blog', 'Compile Grunt Blog', function () {
    grunt.log.ok('Generating blog...');

    // Set default marked options
    marked.setOptions({
      gfm:true,
      anchors:true,
      base:'/',
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
        url:destName,
        title:postTitle,
        postDate:blog.formatDate(postDate)
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
          var file = 'src/tmpl/blog.jade',
            templateData = {
              page:'news',
              singlePost:true,
              url:destName,
              title:postTitle,
              postDate:blog.formatDate(postDate),
              postRawDate:postDate,
              articleList:articleList,
              content:marked(src),
              rawSrc:src
            };
          shortList.push(templateData);

          return jade.compile(grunt.file.read(file), {filename:file})(templateData);
        }
      });
    });

    /**
     * Generate the blog page with a list of posts
     */
    grunt.log.ok('Generating blog front page..');
    var blogTpl = 'src/tmpl/blog.jade';
    var blogOut = jade.compile(grunt.file.read(blogTpl), {filename:blogTpl})({
      page:'blog',
      title:'The Grunt Blog',
      content:shortList,
      articleList:articleList
    });
    grunt.file.write('build/blog.html', blogOut);

    /**
     * Generate the RSS feed
     */
    grunt.log.ok('Generating rss feed...');
    // remove anchors from RSS setting
    marked.setOptions({
      anchors:false
    });
    // generate the feed items with different 'marked' settings
    shortList.forEach(function (item) {
      item.rssSrc = marked(item.rawSrc);
      item.atomId = blog.atomIDnTimeStampChurner(item.url, item.postRawDate);
    });
    var rssTpl = 'src/tmpl/rss.jade';
    var rssOut = jade.compile(grunt.file.read(rssTpl), {filename:rssTpl})({
      page:'rss',
      posts:shortList
    });
    grunt.file.write('build/atom.xml', rssOut);

    /**
     * Generate the front page
     */
    grunt.log.ok('Generating the front page...');
    var indexTpl = 'src/tmpl/index.jade';
    var indexOut = jade.compile(grunt.file.read(indexTpl), {filename:indexTpl})({
      page:'index',
      news:shortList.splice(0, 5)
    });
    grunt.file.write('build/index.html', indexOut);
  });
};
