'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    clean: {
      build: ['build/'],
      tmp: ['tmp/']
    },

    less: {
      options: {
        sourceMap: true,
        outputSourceFiles: true
      },
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
          plugins: [
            new (require('less-plugin-clean-css'))({
              compatibility: 'ie9',
              keepSpecialComments: 0
            })
          ]
        },
        files: {
          'build/css/main.css': 'src/less/main.less'
        }
      }
    },

    autoprefixer: {
      options: {
        browsers: [
          'last 2 version',
          '> 1%',
          'Edge >= 12',
          'Explorer >= 9',
          'Firefox ESR',
          'Opera 12.1'
        ]
      },
      main: {
        src: 'build/css/main.css',
        dest: 'build/css/main.css'
      }
    },

    watch: {
      less: {
        files: 'src/less/**/*.less',
        tasks: ['less:development', 'autoprefixer']
      },
      tmpl: {
        files: 'src/tmpl/**/*.pug',
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
      options: {
        compress: true,
        mangle: true,
        output: {
          comments: false
        },
        sourceMap: {
          includeSources: true
        }
      },
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
        files: [{
          expand: true,
          cwd: 'src/',
          src: [
            'img/**',
            'cdn/**',
            'fonts/**'
          ],
          dest: 'build/'
        }]
      },
      root: {
        files: [{
          expand: true,
          cwd: 'src/',
          src: ['*'],
          dest: 'build/',
          filter: 'isFile'
        }]
      }
    },

    sitemap: {
      dist: {
        extension: {
          required: false,
          trailingSlash: false
        },
        homepage: 'https://gruntjs.com/',
        pattern: ['build/**/*.html'],
        siteRoot: './build'
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

    puglint: {
      all: {
        options: {
          extends: '.pug-lintrc.json'
        },
        src: 'src/tmpl/**/*.pug'
      }
    },

    htmllint: {
      src: 'build/**/*.html'
    }

  });

  grunt.loadTasks('tasks'); // getWiki, docs tasks
  require('matchdep')
    .filterAll(['grunt-*', '!grunt-docs'])
    .forEach(grunt.loadNpmTasks);

  grunt.registerTask('build', 'Build the site', [
    'copy',
    'docs',
    'blog',
    'plugins',
    'uglify',
    'sitemap'
  ]);
  grunt.registerTask('default', 'Build the site, download plugins, production ready', [
    'build',
    'downloadPlugins',
    'less:production',
    'autoprefixer'
  ]);
  grunt.registerTask('test', [
    'build',
    'jshint',
    'puglint',
    'htmllint'
  ]);
  grunt.registerTask('dev', 'Development Mode', [
    'build',
    'less:development',
    'autoprefixer',
    'jshint',
    'concurrent'
  ]);
};
