module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    meta: {},
    concat: {
      dist: {
        src: [
        'js/vendor/jquery-1.8.1.js',
        'js/vendor/jquery-ajax-localstorage-cache.js',
        'js/vendor/lodash-0.6.1.js',
        'js/vendor/jquery.timeago.js',
        'js/vendor/list.min.js',
        'js/main.js'
        ],
        dest: 'dist/gruntjs.js'
      }
    },
    min: {
      dist: {
        src: ['dist/gruntjs.js'],
        dest: 'dist/gruntjs.min.js'
      }
    }
    
  });

  // Load local tasks.
  grunt.loadTasks('tasks');

  // Default task.
  grunt.registerTask('default', 'concat min');

};
