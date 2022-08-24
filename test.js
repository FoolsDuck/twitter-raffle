const {
  tweet,
  reply,
  getTweetById,
  getRetweeted,
  getUserById,
  getUserFollowings,
  getUserFollowers,
} = require("./actions");

const tweetTest = async (txt) => {
  const res = await tweet(txt);
  console.log(res);
};

// tweetTest(
//   "🥳 The happy random winner for 1393586729639190529 raffle is @6ifka_eth, Congratulations! https://twitter.com/topshorter_eth/status/1393586729639190529 🥳"
// );

const getTweetTest = async (id) => {
  const res = await getTweetById(id);
  console.log(res);
};

// getTweetTest("1562501108349939719");

const getRetweetedTest = async (id) => {
  const res = await getRetweeted(id);
  console.log(res);
};

// getRetweetedTest("1555664681783726080");

const getUserByIdTest = async (id) => {
  const user = await getUserById(id);
  console.log(user.data.username);
};

// getUserByIdTest("1304474241639751682");

const getUserFollowingsTest = async (id) => {
  const user = await getUserFollowings(id);
  console.log(user);
};

// getUserFollowingsTest("1562553200246681600");

const getUserFollowersTest = async (id) => {
  const user = await getUserFollowers(id);
  console.log(user);
};

// getUserFollowersTest("1562553200246681600");
