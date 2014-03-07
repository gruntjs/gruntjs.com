Grunt Website
==========================

## Setup Development

1. `npm install`
1. `grunt`

## Tasks

* `grunt build` - Manually Rebuild
* `grunt dev` - Development Mode


## Manually Run Server

1. `npm start`
Server port is : `5678`.

## Deploy to Heroku

Set Heroku keys (if needed) with
```
ssh-keygen -t rsa -C "YOUR_HEROKU_EMAIL" -f  ~/.ssh/id_rsa_heroku

ssh-add ~/.ssh/id_rsa_heroku

heroku keys:add ~/.ssh/id_rsa_heroku.pub

```

Push

```
git push git@heroku.com:grunt.git master:master
```

If you need to regenerate the Heroku site, use empty commits:

```
git commit --allow-empty -m "empty commit"
git push git@heroku.com:grunt.git master:master
```
