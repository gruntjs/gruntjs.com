'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // server port, used to serve the site and run tests
    server_port: 5678,
    // wiki url
    wiki_url: 'https://github.com/gruntjs/grunt.wiki.git',
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

    watch: {
      less: {
        files: 'src/less/*.less',
        tasks: ['less:development']
      },
      tmpl: {
        files: 'src/tmpl/**/*.js',
        tasks: ['jade', 'default']
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
      notfound: {
        options: {
          data: {
            page: 'notfound',
            title: '404 Not Found'
          }
        },
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
          {expand: true, cwd: 'src/', src: ['img/**', 'fonts/**', 'js/vendor/lib/modernizr.min.js'], dest: 'build/'}
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
    }
  });

  // Load contrib tasks
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  // Load local tasks
  grunt.loadTasks('tasks'); // getWiki, docs tasks
  
  grunt.registerTask('build', ['clean', 'copy', 'jade', 'docs', 'blog', 'plugins', 'concat']);
  grunt.registerTask('default', ['build', 'less:production']);
  grunt.registerTask('dev', ['build', 'less:development', 'jshint', 'watch']);
  grunt.registerTask('test', ['nodeunit']);
  grunt.registerTask('serve', ['server']);
};
