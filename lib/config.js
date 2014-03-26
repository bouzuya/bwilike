module.exports = {
  mongoUrl:              process.env.BWILIKE_MONGODB_URL || process.env.MONGOLAB_URI,
  sessionSecret:         process.env.BWILIKE_SESSION_SECRET,
  twitterConsumerKey:    process.env.BWILIKE_TWITTER_CONSUMER_KEY,
  twitterConsumerSecret: process.env.BWILIKE_TWITTER_CONSUMER_SECRET,
  twitterCallbackUrl:    process.env.BWILIKE_TWITTER_CALLBACK_URL,
  githubClientId:        process.env.BWILIKE_GITHUB_CLIENT_ID,
  githubClientSecret:    process.env.BWILIKE_GITHUB_CLIENT_SECRET,
  githubCallbackUrl:     process.env.BWILIKE_GITHUB_CALLBACK_URL,
  awsSqsQueueUrl:        process.env.BWILIKE_AWS_SQS_QUEUE_URL
};

