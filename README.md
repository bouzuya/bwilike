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

    $ export BWILIKE_MONGODB_URL='mongodb://localhost:27017/bwilike'
    $ export BWILIKE_TWITTER_CONSUMER_KEY='xxxxxxxxxxxxxxxxxxxxx'
    $ export BWILIKE_TWITTER_CONSUMER_SECRET='xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    $ export BWILIKE_TWITTER_CALLBACK_URL='http://localhost:3000/auth/twitter'
    $ export BWILIKE_GITHUB_CLIENT_ID='xxxxxxxxxxxxxxxxxxxx'
    $ export BWILIKE_GITHUB_CLIENT_SECRET='xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    $ export BWILIKE_GITHUB_CALLBACK_URL='http://localhost:3000/auth/github'
    $ export BWILIKE_SESSION_SECRET='abcdefg'
    $ export BWILIKE_AWS_SQS_QUEUE_URL='https://sqs.ap-northeast-1.amazonaws.com/xxxxxxxxxxxx/bwilike'
    $ export AWS_ACCESS_KEY_ID='xxxxxxxxxxxxxxxxxxxx'
    $ export AWS_SECRET_ACCESS_KEY='xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    $ export AWS_REGION='ap-northeast-1'

Deploy on Heroku
------------------------------------------------------------------------------

### MongoLab

    $ heroku addons:add mongolab

### Scheduler

    $ heroku addons:add scheduler 
    $ heroku addons:open scheduler
    > $ npm run-script daily 1X Daily
    > $ npm run-script every-10-minutes 1X Every 10 minutes

