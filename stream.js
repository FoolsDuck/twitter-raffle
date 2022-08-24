const dotenv = require("dotenv").config();
const needle = require("needle");
const {
  reply,
  getTweetById,
  getRetweeted,
  getUserById,
  getUserFollowers,
  tweet,
} = require("./actions");
const token = process.env.BEARER;

const rulesURL = "https://api.twitter.com/2/tweets/search/stream/rules";
const streamURL = "https://api.twitter.com/2/tweets/search/stream";

const rules = [
  {
    value: "-from:GetRandomWinner -to:GetRandomWinner @GetRandomWinner",
  },
];

async function getAllRules() {
  const response = await needle("get", rulesURL, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (response.statusCode !== 200) {
    console.log("Error:", response.statusMessage, response.statusCode);
    throw new Error(response.body);
  }

  return response.body;
}

async function deleteAllRules(rules) {
  if (!Array.isArray(rules.data)) {
    return null;
  }

  const ids = rules.data.map((rule) => rule.id);

  const data = {
    delete: {
      ids: ids,
    },
  };

  const response = await needle("post", rulesURL, data, {
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
  });

  if (response.statusCode !== 200) {
    throw new Error(response.body);
  }

  return response.body;
}

async function setRules() {
  const data = {
    add: rules,
  };

  const response = await needle("post", rulesURL, data, {
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
  });

  if (response.statusCode !== 201) {
    throw new Error(response.body);
  }

  return response.body;
}

function streamConnect(retryAttempt) {
  const stream = needle.get(streamURL, {
    headers: {
      "User-Agent": "v2FilterStreamJS",
      Authorization: `Bearer ${token}`,
    },
    timeout: 20000,
  });

  stream
    .on("data", async (data) => {
      try {
        const json = JSON.parse(data);
        const myFollowers = await getUserFollowers("1562553200246681600");
        console.log(json);
        const thread = await getTweetById(json.data.id);
        const mainThread = await getTweetById(thread.in_reply_to_status_id_str);
        const author = mainThread.user.id_str;

        // const participatns = await getRetweeted(mainThread.id_str);
        // if (participatns.length > 0) {
        //   const winner =
        //     participatns[Math.floor(Math.random() * participatns.length)];
        //   const winnerAccount = await getUserById(winner);

        //   const tweetContent = `🥳 The happy random winner for ${mainThread.id_str} raffle is @${winnerAccount.data.username}, Congratulations! \n https://twitter.com/${mainThread.user.screen_name}/status/${mainThread.id_str} 🥳`;
        //   console.log(tweetContent);
        //   await tweet(tweetContent);
        // }

        const isFollower = myFollowers.includes(author);
        let tweetContent;
        const participatns = await getRetweeted(mainThread.id_str);
        if (participatns.length > 0) {
          const winner =
            participatns[Math.floor(Math.random() * participatns.length)];
          const winnerAccount = await getUserById(winner);
          if (isFollower) {
            tweetContent = `🥳 The happy random winner for ${mainThread.user.id_str} raffle is @${winnerAccount.data.username}, Congratulations! \n https://twitter.com/${mainThread.user.screen_name}/status/${mainThread.user.id_str} 🥳`;
            await tweet(tweetContent);
          } else {
            if (!mainThread.full_text.includes("@GetRandomWinner")) {
              tweetContent = `🥳 Can't tweet that if author doesn't follow me, but anyway the random winner could be @${winnerAccount.data.username}, follow me to randomly pick a winner for your raffle! \n https://twitter.com/GetRandomWinner/status/1562582872124706816/photo/1`;
              reply(mainThread.id_str, tweetContent);
            }
          }
        }

        // A successful connection resets retry count.
        retryAttempt = 0;
      } catch (e) {
        if (
          data.detail ===
          "This stream is currently at the maximum allowed connection limit."
        ) {
          console.log(data.detail);
          process.exit(1);
        } else {
          // Keep alive signal received. Do nothing.
        }
      }
    })
    .on("err", (error) => {
      if (error.code !== "ECONNRESET") {
        console.log(error.code);
        process.exit(1);
      } else {
        setTimeout(() => {
          console.warn("A connection error occurred. Reconnecting...");
          streamConnect(++retryAttempt);
        }, 2 ** retryAttempt);
      }
    });

  return stream;
}

(async () => {
  let currentRules;

  try {
    // await setRules();
    currentRules = await getAllRules();
    console.log(currentRules);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }

  // Listen to the stream.
  streamConnect(0);
})();
