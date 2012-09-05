module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    meta: {},
    concat: {
      dist: {
        src: [
        'js/lib/jquery-1.8.1.js',
        'js/lib/jquery-ajax-localstorage-cache.js',
        'js/lib/lodash-0.6.1.js',
        'js/lib/jquery.timeago.js',
        'js/lib/list.min.js',
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
