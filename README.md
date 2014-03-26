bwilike
==============================================================================

[![Build Status](https://travis-ci.org/bouzuya/bwilike.png?branch=master)](https://travis-ci.org/bouzuya/bwilike)

[bwilike.me][] is twitter bio (like:) updater.

bwilike.me updates [twitter][] bio based on [github](https://github.com/) activity.

[bwilike.me]: http://bwilike.me/
[twitter]: https://twitter.com/
[github]: https://github.com/

Configuration
------------------------------------------------------------------------------

    $ heroku config:set BWILIKE_MONGODB_URL='mongodb://localhost:27017/bwilike'
    $ heroku config:set BWILIKE_TWITTER_CONSUMER_KEY='xxxxxxxxxxxxxxxxxxxxx'
    $ heroku config:set BWILIKE_TWITTER_CONSUMER_SECRET='xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    $ heroku config:set BWILIKE_TWITTER_CALLBACK_URL='http://localhost:3000/auth/twitter'
    $ heroku config:set BWILIKE_GITHUB_CLIENT_ID='xxxxxxxxxxxxxxxxxxxx'
    $ heroku config:set BWILIKE_GITHUB_CLIENT_SECRET='xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    $ heroku config:set BWILIKE_GITHUB_CALLBACK_URL='http://localhost:3000/auth/github'
    $ heroku config:set BWILIKE_SESSION_SECRET='abcdefg'
    $ heroku config:set BWILIKE_AWS_SQS_QUEUE_URL='https://sqs.ap-northeast-1.amazonaws.com/xxxxxxxxxxxx/bwilike'
    $ heroku config:set NEW_RELIC_LICENSE_KEY='<your license key>'
    $ heroku config:set NEW_RELIC_APP_NAME='bwilike'
    $ heroku config:set AWS_ACCESS_KEY_ID='xxxxxxxxxxxxxxxxxxxx'
    $ heroku config:set AWS_SECRET_ACCESS_KEY='xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    $ heroku config:set AWS_REGION='ap-northeast-1'

Deploy on Heroku
------------------------------------------------------------------------------

### MongoLab

    $ heroku addons:add mongolab

### Scheduler

    $ heroku addons:add scheduler 
    $ heroku addons:open scheduler
    > $ npm run-script daily 1X Daily
    > $ npm run-script every-10-minutes 1X Every 10 minutes

### New Relic 

    $ heroku addons:add newrelic
    

