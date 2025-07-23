// Load environment variables from .env file
require('dotenv').config();

// Create config object from environment variables
config = module.exports = {
  SERVER_PREFX: process.env.SERVER_PREFIX || "s1_*",
  logEnabled: process.env.LOG_ENABLED === 'true',
  LocalIP: process.env.LOCAL_IP || "127.0.0.1",
  SERVER_PORT: parseInt(process.env.SERVER_PORT) || 7002,
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: parseInt(process.env.DB_PORT) || 27017,
  DB_NAME: process.env.DB_NAME || "TeenPattiEncrypt",
  DB_USER: process.env.DB_USER || "",
  "DB-PASSWORD": process.env.DB_PASSWORD || "",
  BASE_URL: process.env.BASE_URL || "192.168.29.34",
  ENCRYPT_KEY: process.env.ENCRYPT_KEY || "6e569b0abf07b5df8ece72211d5afee4",
  ENCRYPT_IV: process.env.ENCRYPT_IV || "0159753852456111",
  PER_TABLE_PLAYER: parseInt(process.env.PER_TABLE_PLAYER) || 5,
  NEWUSER_CHIPS: parseInt(process.env.NEWUSER_CHIPS) || 100000,
  NEWUSER_COINS: parseInt(process.env.NEWUSER_COINS) || 10,
  NEWUSER_FBCHIPS: parseInt(process.env.NEWUSER_FBCHIPS) || 300000,
  GAME_START_SERVICE_TIMER: parseInt(process.env.GAME_START_SERVICE_TIMER) || 5000,
  GAME_START_SERVICE_TIMER_D: parseInt(process.env.GAME_START_SERVICE_TIMER_D) || 7000,
  GAME_CARD_DISTRIBUTE_TIMER: parseInt(process.env.GAME_CARD_DISTRIBUTE_TIMER) || 2000,
  GAME_TURN_TIMER: parseInt(process.env.GAME_TURN_TIMER) || 10000,
  GAME_TURN_TIMER_D: parseInt(process.env.GAME_TURN_TIMER_D) || 12000,
  GAME_VARIATION_SELECT_TIMER: parseInt(process.env.GAME_VARIATION_SELECT_TIMER) || 15000,
  ROBOT_ADD_TIMER: parseInt(process.env.ROBOT_ADD_TIMER) || 5000,
  REWARD_VIDEO_CHIPS: parseInt(process.env.REWARD_VIDEO_CHIPS) || 5000,
  GAME_VARIATIONS: process.env.GAME_VARIATIONS ? JSON.parse(process.env.GAME_VARIATIONS) : [
    {"id":2, "name":"Ak47", "desc":"Ace, King, 4, and 7 become the jokers in this variation."}, 
    {"id":3, "name":"Lowest Joker","desc":"Each player's lowest-ranking card (and all other cards of that same rank/strength/number) are jokers (wild cards) in that player's hand only. If the two lowest cards are a pair then that pair is considered as two jokers."}, 
    {"id":4, "name":"Muflis","desc":"The least ranking combination has the highest rank and vice versa."}, 
    {"id":5, "name":"4X Boot Value","desc":"Boot will be 4 times in this variation"},
    {"id":6, "name":"1942 A Love Story", "desc":"Here, 1, 9, 4, 2 are all jokers, and the catch is that you can't speak in English during this game! Stick to Hindi, or you'll be out!"},
    {"id":7, "name":"Blackjack", "desc":"he sum of all three cards that you get, must be 21 or below. Anything above 21, is considered 'bust' or disqualified. Picture cards carry 10 points, aces carry one point or 11 points, and all other cards carry points as per their face value. The player whose cards add up closest to 21, wins the game."},
    {"id":8, "name":"999", "desc":"Here, the cards that are closest to 999 tend to win. So, the J, Q, K, & 10 card will be treated as 0. Ace will be 1. Then, if you've 4, 9, & Ace, then your cards will be 941. Now, if you've 10, 9, & K, then your cards will be 900."}
  ]
};

express = require("express");
app = express();

const fileUpload = require("express-fileupload");
app.use(fileUpload());

const http = require("http").Server(app);
const url = require("url");
const path = require("path");

const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + "/public"));

const mongod = require("mongodb");
objectId = module.exports = require("mongodb").ObjectID;
schedule = module.exports = require("node-schedule");

request = module.exports = require("request");
ecClass = module.exports = require("./classes/eventCases.Class.js");
commonClass = module.exports = require("./classes/commonCases.Class.js");
moment = module.exports = require("moment");

signupClass = module.exports = require("./classes/signupCases.Class.js");
cardClass = module.exports = require("./classes/cardCases.Class.js");
userSettingCases =
  module.exports = require("./classes/userSettingCases.Class.js");
tablesManager =
  module.exports = require("./classes/tablesManagerCases.Class.js");
timerClass = module.exports = require("./classes/timerCases.Class.js");
playingCases = module.exports = require("./classes/playingCases.Class.js");
friendsCases = module.exports = require("./classes/friendsCases.Class.js");
notificationCases =
  module.exports = require("./classes/notificationCases.Class.js");
chipsTrackerCases =
  module.exports = require("./classes/chipsTrackerCases.Class.js");
chipStoreCases = module.exports = require("./classes/chipStoreCases.Class.js");
coinStoreCases = module.exports = require("./classes/coinStoreCases.Class.js");
miniGamesCases = module.exports = require("./classes/miniGamesCases.Class.js");
autoCases = module.exports = require("./classes/autoCases.Class.js");
tournamentCases = module.exports = require("./classes/tournamentCases.Class.js");

_ = module.exports = require("lodash");

/* ======================================================
 			socket.io Handler
   ====================================================*/

io = module.exports = require("socket.io")(http);

io.sockets.on("connection", function (socket) {
  // console.log('client connect');
  ecClass.bind(socket);
});

/*======================================================
            Some GlobalArray & Logger Defination
======================================================*/

printLog = module.exports = function (argument) {
  if (config.logEnabled) {
    console.log(argument);
  }
};

/*======================================================
            mongodb conection
=======================================================*/
var MongoClient = mongod.MongoClient;

var databaseURL =
  "mongodb://" + config.DB_HOST + ":" + config.DB_PORT + "/" + config.DB_NAME;

MongoClient.connect(
  databaseURL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  function (err, database) {
    if (err) {
      printLog("Database Connection Error");
      printLog(err);
    } else {
      console.log("conection done::");
      db = module.exports = database.db(config.DB_NAME);

      db.collection("game_users").updateMany(
        { socketId: { $ne: "" } },
        { $set: { socketId: "" } }
      );
      db.collection("game_users").updateMany(
        { is_robot: true },
        { $set: { status: 0 } }
      );

      var rule = { hour: 3, minute: 1, dayOfWeek: 1 };
      var logCost = schedule.scheduleJob(rule, function () {
        db.collection("game_users")
          .find({})
          .project({ cwchips: 1 })
          .forEach(function (e) {
            var upWhere = { $set: { lwchips: e.cwchips, cwchips: 0 } };
            db.collection("game_users").update({ _id: e._id }, upWhere);
          });
      });

      schedule.scheduleJob("00 00 00 * * *", function () {
        var pack = cardClass.createPack();
        var myPack = cardClass.shufflePack(pack);
        var card = cardClass.draw(myPack, 3, "", true);

        db.collection("game_options").updateOne(
          { TYPE: "LUCKYCARD" },
          { $set: { INFO: card } }
        );

        db.collection("game_users").updateMany(
          {
            is_robot: false,
            socketId: { $exists: true, $ne: "" },
            "lasts.ll": {
              $lt: new Date(new Date().setDate(new Date().getDate() - 1)),
            },
          },
          { $set: { socketId: "" } }
        );
      });

      var event = schedule.scheduleJob("*/1 * * * *", function () {
        db.collection("game_users").updateMany(
          { chips: { $lt: 0 } },
          { $set: { chips: 0 } }
        );
      });
    }
  }
);

require("./routes/index.js")();

http.listen(config.SERVER_PORT, function () {
  console.log(
    "-----------------------------------SERVER RESTARTED-----------------------------------"
  );
  console.log("Listening on " + config.SERVER_PORT);
  console.log(
    "-----------------------------------SERVER RESTARTED-----------------------------------"
  );
});
