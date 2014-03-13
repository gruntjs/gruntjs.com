"use strict";

module.exports = function(grunt) {

  grunt.initConfig({
    clean: {
      build: ['build/'],
      tmp: ['tmp/']
    },

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
        tasks: ['uglify']
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

    uglify: {
      plugins: {
        src: [
          'src/js/vendor/lib/jquery.js',
          'src/js/vendor/lib/jquery.dataTables.js',
          'src/js/vendor/*.js',
          'src/js/plugins.js'
        ],
        dest: 'build/js/plugins.js'
      },
      contributing: {
        src: ['src/js/contributing.js'],
        dest: 'build/js/contributing.js'
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

    open: {
      dev: {
        path: 'http://localhost:5678/'
      }
    },

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    concurrent: {
      server: ['nodemon', 'watch', 'open'],
      options: {
        logConcurrentOutput: true
      }
    }
  });

  grunt.loadTasks('tasks'); // getWiki, docs tasks
  require('matchdep').filterAll(['grunt-*', '!grunt-cli', '!grunt-docs']).forEach(grunt.loadNpmTasks);

  grunt.registerTask('build', 'Build the site', ['copy', 'jade', 'docs', 'blog', 'plugins', 'uglify']);
  grunt.registerTask('default', 'Build the site, download plugins, production ready', ['build', 'downloadPlugins', 'less:production']);
  grunt.registerTask('dev', 'Development Mode', ['build', 'less:development', 'jshint', 'concurrent']);
};
