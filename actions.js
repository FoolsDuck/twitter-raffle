const rwClient = require("./twitterClient.js");

const getTweetById = async (id) => {
  try {
    const res = await rwClient.v1.singleTweet(id);
    return res;
  } catch (err) {
    console.error(err);
  }
};

const reply = async (id, txt) => {
  try {
    await rwClient.v1.reply(txt, id);
  } catch (err) {
    console.error(err);
  }
};

const getRetweeted = async (id) => {
  let res = [];
  const usersPaginated = await rwClient.v2.tweetRetweetedBy(id, {
    asPaginator: true,
  });
  for await (const user of usersPaginated) {
    res.push(user.id);
  }

  return res;
};

const getUserFollowings = async (id) => {
  let res = [];
  const followingsPaginator = await rwClient.v2.following(id, {
    asPaginator: true,
  });

  for await (const user of followingsPaginator) {
    res.push(user.id);
  }

  return res;
};

const getUserFollowers = async (id) => {
  let res = [];
  const followers = await rwClient.v2.followers(id, {
    asPaginator: true,
  });

  for await (const user of followers) {
    res.push(user.id);
  }

  return res;
};

const getUserById = async (id) => {
  const user = await rwClient.v2.user(id);
  return user;
};

const tweet = async (txt) => {
  const { data: createdTweet } = await rwClient.v2.tweet(txt);
  return createdTweet;
};

module.exports.tweet = tweet;
module.exports.reply = reply;
module.exports.getTweetById = getTweetById;
module.exports.getRetweeted = getRetweeted;
module.exports.getUserById = getUserById;
module.exports.getUserFollowings = getUserFollowings;
module.exports.getUserFollowers = getUserFollowers;
