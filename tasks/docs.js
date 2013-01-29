/*
 * grunt api docs
 * http://gruntjs.com/
 *
 * Copyright (c) 2013 grunt contributors
 * Licensed under the MIT license.
 */

var Path = require('path'),
  fs = require('fs'),
  exec = require('child_process').exec,
  jade = require('jade');

module.exports = function (grunt) {
  'use strict';


  /**
   * Custom task to generate grunt documentation
   */
  grunt.registerTask('docs', 'Compile Grunt Docs to HTML', function () {
    var done = this.async();
    grunt.log.ok('Generating docs...');

    // clean the wiki directory, clone a fresh copy
    exec('git clone https://github.com/gruntjs/grunt.wiki.git tmp/wiki', function (error) {
      if (error) {
        // failed to git clone the wiki
        grunt.log.warn('Warning: Could not clone the wiki!');
      }

      // check if grunt md exists
      fs.exists('tmp/wiki/grunt.md', function (exists) {
        if (exists) {
          // confirm the wiki exists, if so generate the docs
          generateDocs();
        } else {
          // failed to get the wiki
          grunt.log.error('Error: The wiki is missing...');
          done(false);
        }
      });
    });


    /**
     * generate the docs based on the github wiki
     */
    function generateDocs() {
      // marked markdown parser
      var marked = require('marked');
      // Set default marked options
      marked.setOptions({
        gfm:true,
        pedantic:false,
        sanitize:true,
        // convert .md links to .html
        convertLinks:true,
        // callback for code highlighter
        highlight:function (code) {
          return code;
        }
      });

      // grunt guides - wiki articles that are not part of the grunt api
      generateGuides();

      // docs for core grunt contrib plugins
      //generateContrib(); // TODO: Coming soon..

      // grunt api docs - wiki articles that start with 'grunt.*'
      generateAPI();
      grunt.log.ok('Created files.');
      done(true);


      /**
       *
       * Helper Functions
       *
       */

      /**
       * Generate grunt guides documentation
       */
      function generateGuides() {
        grunt.log.ok('Generating Guides...');

        // API Docs
        var sections = [],
          base = 'tmp/wiki/',
          names = grunt.file.expand({cwd:base}, ['*', '!grunt*.md', '!*.js']);

        // Generate Sections
        names.forEach(function (name) {
          var section = {
            name:name.replace('-', ' ').replace('.md', ''),
            url:name.replace('.md', '').toLowerCase()
          };
          sections.push(section);
        });

        names.forEach(function (name) {

          var title = name.replace('-', ' ').replace('.md', ''),
            src = base + name,
            dest = 'build/docs/' + name.replace('.md', '').toLowerCase() + '.html';

          grunt.file.copy(src, dest, {
            process:function (src) {

              try {
                var file = 'src/tmpl/docs.jade',
                  templateData = {
                    page:'docs',
                    title:title,
                    content:marked(src),
                    sections:sections
                  };
                return jade.compile(grunt.file.read(file), {filename:file})(templateData);
              } catch (e) {
                grunt.log.error(e);
                grunt.fail.warn('Jade failed to compile.');
              }
            }
          });
        });
        grunt.log.ok('Created ' + names.length + ' files.');
      }


      /**
       * Generate grunt API documentation
       */
      function generateAPI() {
        grunt.log.ok('Generating API Docs...');
        // API Docs
        var sections = [],
          base = 'tmp/wiki/',
          names = grunt.file.expand({cwd:base}, ['grunt.*.md', '!*utils*']);

        names = names.map(function (name) {
          return name.substring(0, name.length - 3);
        });


        // Generate Sections
        names.forEach(function (name) {
          var section = {
            name:name.replace('.md', ''),
            url:name.replace('grunt.', '').replace('.md', '').toLowerCase()
          };
          sections.push(section);
        });

        // the default api page is special
        names.push('grunt');

        names.forEach(function (name) {
          var title = name.replace('grunt.', ''),
            section = {name:name},
            src = base + name + '.md',
            dest = 'build/api/' + title + '.html';

          grunt.file.copy(src, dest, {
            process:function (src) {
              try {
                var file = 'src/tmpl/docs.jade',
                  templateData = {
                    page:'api',
                    title:title,
                    content:marked(src),
                    sections:sections
                  };
                return jade.compile(grunt.file.read(file), {filename:file})(templateData);
              } catch (e) {
                grunt.log.error(e);
                grunt.fail.warn('Jade failed to compile.');
              }
            }
          });
        });
        grunt.log.ok('Created ' + names.length + ' files.');
      }


      /**
       * Generates documentation for all grunt-contrib modules
       */
      function generateContrib() {
        grunt.log.ok('Generating Contrib Docs...');
        var sections = [];

        var base = 'node_modules/grunt-contrib/node_modules/';
        var names = grunt.file.expand({cwd:base}, 'grunt-contrib-*');
        names = names.map(function (name) {
          return name.replace(/.*-([^\-]+)\//, '$1');
        });

        names.forEach(function (name) {
          var title = name.replace('grunt-contrib-', '');
          var section = {name:title};
          sections.push(section);

          var src = base + name + '/README.md';
          var dest = 'build/contrib/' + title + '.html';
          grunt.file.copy(src, dest, {
            process:function (src) {
              section.description = src.split('\n')[1].replace(/^>\s+/, '');
              return marked(wikiAnchors(src));
            }
          });
        });


        /**
         * Create links from wiki anchors
         */
        function wikiAnchors(text, config) {
          var bu = '';
          text = text.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, function (wholeMatch, m1, m2) {
            var ext = /\/\//.test(m2),
              path = ext ? m2 : Path.join(bu, m2.split(' ').join('-'));

            return "[" + m1 + "](/" + path + ")";

          });

          text = text.replace(/\[\[([^\]]+)\]\]/g, function (wholeMatch, m1) {
            var path = Path.join(bu, m1.split(' ').join('-'));

            if ((/^grunt/).test(path)) {
              path = path.replace('grunt.', 'api/');
            } else {
              path = 'docs/' + path;
            }
            return "[" + m1 + "](/" + path + ")";
          });
          return text;
        }
      }
    }
  });
};
