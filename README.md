# Grunt Website [![Build Status: Linux](https://travis-ci.org/gruntjs/gruntjs.com.svg?branch=master)](https://travis-ci.org/gruntjs/gruntjs.com)

## Setup Development

1. `npm install`
2. `grunt`

## Tasks

* `grunt build` - Manually Rebuild
* `grunt dev` - Development Mode

## Manually Run Server

```shell
npm start
```

Server port is: `5678`.

## Deploy to Heroku

Set Heroku keys (if needed) with

```shell
ssh-keygen -t rsa -C "YOUR_HEROKU_EMAIL" -f  ~/.ssh/id_rsa_heroku
ssh-add ~/.ssh/id_rsa_heroku
heroku keys:add ~/.ssh/id_rsa_heroku.pub
```

Push

```shell
git push git@heroku.com:grunt.git master:master
```

If you need to regenerate the Heroku site, use empty commits:

```shell
git commit --allow-empty -m "empty commit"
git push git@heroku.com:grunt.git master:master
```
