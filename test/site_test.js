'use strict';

var grunt = require('grunt'),
  request = require('request');

exports.nodeunit = {
  setUp: function (callback) {
    this.server = 'http://localhost:' + grunt.config.get('server_port');
    callback();
  },
  test_server: function(test) {
    request(this.server, function (error) {
      test.expect(1);
      if (!error) {
        test.ok(true, 'Server works');
      } else {
        test.ok(false, 'Server is not running or cannot access: ' + this.server);
      }
      test.done();
    })
  },
  test_not_found: function(test) {
    request(this.server + '/some-page-that-does-not-exist', function (error, response) {
      test.expect(1);
      if (!error && response.statusCode === 404) {
        test.ok(true, '404 works');
      } else {
        test.ok(false, '404 fails, got ' + response.statusCode);
      }
      test.done();
    })
  }
};
