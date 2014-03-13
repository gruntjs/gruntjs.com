(function () {
    var outerWrapper = document.querySelectorAll('.content')[0],
      innerWrapper = outerWrapper.querySelectorAll('.hero-unit')[0],
      targetElement = innerWrapper.getElementsByTagName('h1')[1],
      ul = document.createElement('ul'),
      TOKEN = '88509e9d693b5bf23e39f10aadc1e8b68ded28d7',
      hasIssues = false;

  /**
   * Init function
   */
  var init = function() {
    getData('repos', 'https://api.github.com/orgs/gruntjs/repos?access_token=' + TOKEN);
    insertData();
  };

  /**
   * Insert node with issues list or no issues msg.
   */
  var insertData = function() {
    if (hasIssues === false) {
      var p = document.createElement('p'),
          em = document.createElement('em');
      em.textContent = 'There are currently no issues marked as \'needs PR!\'';
      p.appendChild(em);
      innerWrapper.insertBefore(p, targetElement);
    } else {
      innerWrapper.insertBefore(ul, targetElement);
    }
  };

  /**
   * Return true if repository is not grunt-init-*-sample
   * @param  {string}  repoName
   * @return {Boolean}
   */
  var isNotSampleRepository = function(repoName) {
    return !(/sample/g.test(repoName));
  };

  /**
   * Parse repositories
   * @param  {Object} repos
   */
  var parseRepos = function(repos) {
    var reposLen = repos.length;

    for (var i = 0; i < reposLen; i++) {
      var repoName = repos[i].name;

      if (isNotSampleRepository(repoName)) {
        var url = 'https://api.github.com/repos/gruntjs/' + repoName + '/issues?state=open&access_token=' + TOKEN;
        getData('issues', url);
      }
    }
  };

  /**
   * Insert <li> node to <ul> with actual 'needs PR' issue
   * @param  {Object} actualIssue
   */
  var insertIssue = function(actualIssue) {
    var li = document.createElement('li'),
         a = document.createElement('a');
    hasIssues = true;

    li.textContent = actualIssue.html_url.split('/')[4] + ' - ';
    a.setAttribute('href', actualIssue.html_url);
    a.textContent = actualIssue.title;
    li.appendChild(a);
    ul.appendChild(li);
  };

  /**
   * Parse issues
   * @param  {Object} issues
   */
  var parseIssues = function(issues) {
    var issuesLen = issues.length;
    if (issuesLen === 0) {
      return;
    }

    for (var  i = 0; i < issuesLen; i++) {
      var actualIssue = issues[i],
          labelLen = actualIssue.labels.length;

      for(var j = 0; j < labelLen; j++) {
        if (actualIssue.labels[j].name === 'needs PR') {
          insertIssue(actualIssue);
        }
      }

    }
  };

  /**
   * Get XMLHttpRequest
   * @param  {string} reqType Type of request (eg. 'issues' | 'repos')
   * @param  {string} url
   */
  var getData = function(reqType, url) {
    request = new XMLHttpRequest();
    request.open('GET', url, false);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400){
        data = JSON.parse(request.responseText);

        if (reqType === 'repos') {
          parseRepos(data);
        } else if (reqType === 'issues') {
          parseIssues(data);
        }

      }
    };
    request.send();
  };

  init();
})();
