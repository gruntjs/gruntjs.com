'use strict';

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Load local tasks
  grunt.loadTasks('tasks'); // getWiki, docs tasks

  // Project configuration.
  grunt.initConfig({
    // clean directories
    clean: {
      build: ['build/'],
      tmp: ['tmp/']
    },
    jshint: {
      all: ['Gruntfile.js']
    },
    // compile less -> css
    less: {
      development: {
        options: {
          paths: ["src/less"]
        },
        files: {
          "build/css/main.css": "src/less/main.less"
        }
      },
      production: {
        options: {
          paths: ["src/less"],
          yuicompress: true
        },
        files: {
          "build/css/main.css": "src/less/main.less"
        }
      }
    },
    // watch
    watch: {
      less: {
        files: 'src/less/*.less',
        tasks: ['less:development']
      },
      tmpl: {
        files: 'src/tmpl/**',
        tasks: ['jade']
      },
      js: {
        files: 'src/js/**',
        tasks: ['concat']
      },
      other: {
        files: 'src/img/**',
        tasks: ['default']
      }
    },
    // compile page layouts
    jade: {
      index: {
        options: {
          data: {
            page: 'index'
          }
        },
        files: {
          "build/index.html": "src/tmpl/index.jade"
        }
      },
      plugins: {
        options: {
          data: {
            page: 'plugins'
          }
        },
        files: {
          "build/plugins.html": "src/tmpl/plugins.jade"
        }
      },
      other: {
        files: {
          "build/404.html": "src/tmpl/404.jade"
        }
      }
    },

    concat: {
      // if we add more js, modify this properly
      plugins: {
        src: [
          'src/js/vendor/lib/jquery.js',
          'src/js/vendor/lib/lodash.js',
          'src/js/vendor/*.js',
          'src/js/*.js'
        ],
        dest: 'build/js/plugins.js'
      }
    },

    // copy site source files
    copy: {
      assets: {
        files: [
          {expand: true, cwd: 'src/', src: ['img/**', 'fonts/**'], dest: 'build/'}
        ]
      },
      root: {
        files: [
          {expand: true, cwd: 'src/', src: ['*'], dest: 'build/', filter: 'isFile'}
        ]
      }
    }
  });
  
  grunt.registerTask('build', ['clean', 'copy', 'jade', 'docs', 'concat']);
  grunt.registerTask('default', ['build', 'less:production']);
  grunt.registerTask('dev', ['build', 'less:development', 'jshint', 'watch']);

  // build pack task
  grunt.registerTask('heroku', 'default');
};
