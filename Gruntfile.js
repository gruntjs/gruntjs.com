'use strict';

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jade');

  // Load local tasks
  grunt.loadTasks('tasks'); // getWiki, docs tasks

  // Project configuration.
  grunt.initConfig({
    // clean directories
    clean: {
      build: ['build/'],
      tmp: ['tmp/']
    },
    // compile less -> css
    less: {
      development: {
        options: {
          paths: ["src/less"]
        },
        files: {
          "build/css/main.css": "src/less/main.less",
          "build/css/bootstrap.css": "src/less/bootstrap.less"
        }
      },
      production: {
        options: {
          paths: ["src/less"],
          yuicompress: true
        },
        files: {
          "build/css/main.css": "src/less/main.less",
          "build/css/bootstrap.css": "src/less/bootstrap.less"
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
      community: {
        options: {
          data: {
            page: 'community'
          }
        },
        files: {
          "build/community.html": "src/tmpl/community.jade"
        }
      },
      news: {
        options: {
          data: {
            page: 'news'
          }
        },
        files: {
          "build/news.html": "src/tmpl/news.jade"
        }
      }
    },
    copy: {
      assets: {
        files: [
          {expand: true, cwd: 'src/', src: ['js/**', 'img/**', 'fonts/**'], dest: 'build/'}
        ]
      },
      root: {
        files: [
          {expand: true, cwd: 'src/', src: ['*'], dest: 'build/', filter: 'isFile'}
        ]
      }
    }
  });

  grunt.registerTask('build', ['clean', 'copy', 'jade', 'docs']);
  grunt.registerTask('default', ['build', 'less:production']);
  grunt.registerTask('dev', ['build', 'less:development', 'watch']);
};
