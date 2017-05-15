/**
 * Config var for app
**/
module.exports = {
  mongoDBURI: process.env.MONGOLAB_URI || 'mongodb://admin:admin@ds061335.mongolab.com:61335/heroku_w9bxpzpc',
  port: process.env.PORT || 4941,
  secret: process.env.SECRET || 'mysecret'
};
