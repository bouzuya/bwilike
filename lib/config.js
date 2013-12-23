module.exports = {
  mongoUrl:              process.env.BWILIKE_MONGODB_URL,
  sessionSecret:         process.env.BWILIKE_SESSION_SECRET,
  twitterConsumerKey:    process.env.BWILIKE_TWITTER_CONSUMER_KEY,
  twitterConsumerSecret: process.env.BWILIKE_TWITTER_CONSUMER_SECRET,
  twitterCallbackUrl:    'http://bwilike.me/auth/twitter/',
  githubClientId:        process.env.BWILIKE_GITHUB_CLIENT_ID,
  githubClientSecret:    process.env.BWILIKE_GITHUB_CLIENT_SECRET
  githubCallbackUrl:    'http://bwilike.me/auth/github/',
};

