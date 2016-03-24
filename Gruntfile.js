'use strict';

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
        files: 'src/less/**/*.less',
        tasks: ['less:development']
      },
      tmpl: {
        files: 'src/tmpl/**/*.jade',
        tasks: ['default']
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
        files: 'node_modules/grunt-docs/**',
        tasks: ['default']
      }
    },

    uglify: {
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
      all: [
        'Gruntfile.js',
        'grunt-plugins.js',
        'server.js',
        'src/js/*.js',
        'tasks/**/*.js'
      ],
      options: {
        jshintrc: '.jshintrc'
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
    },

    htmllint: {
      options: {
        ignore: [
          // These should be fixed eventually
          //'The "border" attribute is obsolete. Consider specifying "img { border: 0; }" in CSS instead.',
          //'The "name" attribute is obsolete. Consider putting an "id" attribute on the nearest container instead.'
        ]
      },
      src: 'build//**/*.html'
    }

  });

  grunt.loadTasks('tasks'); // getWiki, docs tasks
  require('matchdep').filterAll(['grunt-*', '!grunt-cli', '!grunt-docs']).forEach(grunt.loadNpmTasks);

  grunt.registerTask('build', 'Build the site', ['copy', 'docs', 'blog', 'plugins', 'uglify']);
  grunt.registerTask('default', 'Build the site, download plugins, production ready', ['build', 'downloadPlugins', 'less:production']);
  grunt.registerTask('test', ['build', 'jshint', 'htmllint']);
  grunt.registerTask('dev', 'Development Mode', ['build', 'less:development', 'jshint', 'concurrent']);
};
