'use strict';

var $ = require('jquery');
var base64 = require('base64');
var markdown = require("markdown");
require("jquery-hashchange");

function Docs(branch, startPage) {
  var that = this;
  this.branch = branch || 'master';
  this.startPage = startPage || 'docs/getting_started.md';

  // default options for github
  this.options = {
    user: 'gruntjs',
    repo: 'grunt',
    sha: this.branch
  };

  // get the docs
  this.docs = {};
  this.github('/repos/:user/:repo/git/trees/:sha?recursive=1', this.options, function(err, data) {
    if (data.meta.status !== 200) {
      $('.content').html(data.data.message);
      return;
    }
    data.data.tree.forEach(function(tree) {
      if (tree.path.indexOf('docs/') !== -1) {
        that.docs[tree.path] = tree;
      }
    });
    that.load();
  });
}

// load the docs into the html
Docs.prototype.load = function() {
  // load toc
  this.markdown('docs/toc.md', $('.toc'));

  // load page
  this.markdown(this.startPage, $('.content'));
};

// get data from github
Docs.prototype.github = function(url, options, callback) {
  var parts = url.match(/:[^\/|\?|\.]+/g);
  parts && parts.forEach(function(part) {
    url = url.replace(part, options[part.substr(1)]);
  });
  $.ajax({
    url: 'https://api.github.com' + url,
    type: 'GET',
    dataType: 'jsonp',
    success: function(data) {
      callback(null, data);
    }
  });
};

// load a single md file, convert and set on html element
Docs.prototype.markdown = function(filepath, into) {
  if (!this.docs[filepath]) {
    return;
  }
  var that = this;
  this.options.sha = this.docs[filepath].sha;
  this.github('/repos/:user/:repo/git/blobs/:sha', this.options, function(err, data) {
    var md = base64.decode(data.data.content);
    md = md.replace(/^```(\w)+/gm, '``` $1');
    markdown(md, function(err, html) {
      into.html(html);
      that.fixLinks(into);
    });
  });
};

// change links to hashes to load dynamically
Docs.prototype.fixLinks = function(el) {
  var that = this;
  $(el).find('a').each(function() {
    var href = $(this).attr('href');
    if (href.indexOf('/') === -1) {
      $(this).attr('href', '#/' + href);
    }
  });
};


$(function() {

  // create our page from the index template
  $('body').html(require('raw!../src/index.html'));

  // hold the last Docs object
  var docs;

  // change the branch of the docs
  // TODO: This will be expanded much more than branch switching
  $(window).hashchange(function() {
    $(window).scrollTop(0);
    var hash = new String(location.hash).substr(2);

    if (hash === 'devel' || hash === 'master') {
      
      // new branch, reload all
      $('.toc,.content').html('<p>Loading...</p>');
      docs = new Docs(hash);

    } else {

      // link to a page
      if (hash) hash = 'docs/' + hash;
      if (docs !== undefined) {
        $('.content').html('<p>Loading...</p>');
        docs.markdown(hash, $('.content'));
      } else {
        var branch = $('.version').find('.active').attr('href');
        if (branch) {
          branch = branch.substr(2);
        }
        docs = new Docs(branch, hash);
      }

    }

    // set active branch
    $('.version').find('a').removeClass('active');
    $('.version').find('a[href="#/' + docs.branch + '"]').addClass('active');

  });
  $(window).hashchange();

});