'use strict';

module.exports = function(grunt) {
  // Load all grunt tasks matching the `grunt-*` pattern.
  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    // server port, used to serve the site and run tests
    server_port: 5678,
    // wiki url
    wiki_url: 'https://github.com/gruntjs/grunt-docs.git',
    // If local is true retrieve the docs from the local
    // grunt-docs which is expected to sit in the
    // same dir as this one.
    local: false,
    // wiki file check, file that exists in the wiki for sure
    wiki_file: 'grunt.md',
    // clean directories
    clean: {
      build: ['build/'],
      tmp: ['tmp/']
    },
    // compile less -> css
    less: {
      development: {
        options: {
          paths: ['src/less']
        },
        files: {
          'build/css/main.css': 'src/less/main.less'
        }
      },
      production: {
        options: {
          paths: ['src/less'],
          yuicompress: true
        },
        files: {
          'build/css/main.css': 'src/less/main.less'
        }
      }
    },

    watch: {
      less: {
        files: 'src/less/*.less',
        tasks: ['less:development']
      },
      tmpl: {
        files: 'src/tmpl/**/*.jade',
        tasks: ['jade', 'default']
      },
      js: {
        files: 'src/js/**',
        tasks: ['concat']
      },
      other: {
        files: 'src/img/**',
        tasks: ['default']
      },
      gruntfile: {
        files: 'Gruntfile.js',
        tasks: ['default']
      },
      docs: {
        files: 'grunt-docs/**',
        tasks: ['default']
      }
    },

    // compile page layouts
    jade: {
      notfound: {
        options: {
          data: {
            page: 'notfound',
            title: '404 Not Found'
          }
        },
        files: {
          'build/404.html': 'src/tmpl/404.jade'
        }
      }
    },

    concat: {
      // if we add more js, modify this properly
      plugins: {
        src: [
          'src/js/vendor/lib/jquery.js',
          'src/js/vendor/lib/jquery.dataTables.js',
          'src/js/vendor/*.js',
          'src/js/*.js'
        ],
        dest: 'build/js/plugins.js'
      }
    },

    jshint: {
      all: ['Gruntfile.js', 'tasks/*.js'],
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
        es5: true
      }
    },

    // copy site source files
    copy: {
      assets: {
        files: [
          {expand: true, cwd: 'src/', src: ['img/**', 'cdn/**', 'fonts/**', 'js/vendor/lib/modernizr.min.js'], dest: 'build/'}
        ]
      },
      root: {
        files: [
          {expand: true, cwd: 'src/', src: ['*'], dest: 'build/', filter: 'isFile'}
        ]
      }
    },
    nodeunit: {
      all: ['test/*_test.js']
    },

    // Open the local server.
    open: {
      dev: {
        path: 'http://localhost:<%= server_port %>/'
      }
    },

    concurrent: {
      server: ['server', 'open']
    }
  });

  // Load grunt tasks
  // All npm tasks are loaded via Sindre's load-grunt-tasks.

  // Load local tasks
  grunt.loadTasks('tasks'); // getWiki, docs tasks

  grunt.registerTask('build', ['clean', 'copy', 'jade', 'docs', 'blog', 'plugins', 'concat']);
  grunt.registerTask('default', ['build', 'less:production']);
  grunt.registerTask('dev', ['build', 'less:development', 'jshint', 'watch']);
  grunt.registerTask('test', ['nodeunit']);
  grunt.registerTask('serve', ['concurrent:server']);
};
