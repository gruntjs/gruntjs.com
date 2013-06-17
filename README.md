Grunt Website
==========================


## Build

1. `npm install`
1. `grunt`


## Setup Development

1. `npm install`
1. `grunt` - gets the latest docs, generates the site
1. use ```grunt watch``` if you are editing templates or less files. (Note: doc pages will have to be regenerated)

## Run Server

1. `grunt server`

## Run Tests

1. Make sure the server is running
1. `grunt test`

## Notes

1. Default server port is : `5678`. Configured in the `Gruntfile`

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

