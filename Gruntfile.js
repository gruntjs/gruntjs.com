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
        tasks: ['less', 'autoprefixer']
      },
      tmpl: {
        files: 'src/tmpl/**/*.pug',
        tasks: ['build']
      },
      js: {
        files: 'src/js/**',
        tasks: ['uglify']
      },
      other: {
        files: 'src/img/**',
        tasks: ['build']
      },
      gruntfile: {
        files: 'Gruntfile.js',
        tasks: ['build']
      },
      docs: {
        files: 'node_modules/grunt-docs/**',
        tasks: ['build']
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
      options: {
        ignore: [
          /Trailing slash on void elements has no effect/
        ]
      },
      src: 'build/**/*.html'
    },

    pug: {
      compile: {
        options: {
          data: {
            debug: false
          }
        },
        files: {
          'build/blm.html': ['src/tmpl/blm.pug']
        }
      }
    }

  });

  grunt.loadTasks('tasks'); // getWiki, docs tasks

  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-pug');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-sitemap');

  if (process.env.NODE_ENV !== 'production') {
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-html');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-puglint');
  }

  grunt.registerTask('build', 'Build the site for production', [
    'copy',
    'docs',
    'blog',
    'pug',
    'plugins',
    'uglify',
    'sitemap',
    'downloadPlugins',
    'less',
    'autoprefixer'
  ]);

  grunt.registerTask('test', [
    'build',
    'jshint',
    'puglint',
    // Requires Java 8+
    'htmllint'
  ]);
  grunt.registerTask('dev', 'Development Mode', [
    'build',
    'concurrent'
  ]);
};
