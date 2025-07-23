var cryptoLib = require("cryptlib");

module.exports = {
  bind: function (socket) {
    socket.on("req", function (data) {
      // try{

      // 	var data = JSON.parse(data);

      // }catch(e){

      // 	printLog(e);
      // }

      try {
        // var data = JSON.parse(commonClass.decryptedString(data));
        var data = data;
      } catch (ex) {
        // var data = commonClass.decryptedString(data);
        // socket_emit(socket.id, {status_code: 0, message: 'Invalid'});
        // return;
      }

      printLog(data);
      printLog(data.en);
      printLog("\n\n\n\n\n");
      var en = data.en;

      switch (en) {
        case "GSP": //GUEST signup or login
          signupClass[en](data, socket);
          break;
        case "TPSP": //thirdparty signup or login
          signupClass[en](data, socket);
          break;

        case "JT": //join table
          tablesManager[en](data, socket);
          break;
        case "JFT": //join friend table
          tablesManager[en](data, socket);
          break;

        case "TL": //Tournament list
          tournamentCases[en](data, socket);
          break;
        case "TJ": //Tournament join
          tournamentCases[en](data, socket);
          break;

        case "RL":
          playingCases[en](data, socket);
          break;
        case "RJ":
          playingCases[en](data, socket);
          break;
        case "TT": //turn taken
          playingCases[en](data, socket);
          break;
        case "SC": //see card
          playingCases[en](data, socket);
          break;
        case "PACK": //see card
          playingCases[en](data, socket);
          break;
        case "SHOW": //
          playingCases[en](data, socket);
          break;
        case "SS": //side show
          playingCases[en](data, socket);
          break;
        case "SSA": //side show action
          playingCases[en](data, socket);
          break;
        case "SV": //select variation
          playingCases[en](data, socket);
          break;
        case "SU": //standup
          playingCases[en](data, socket);
          break;
        case "DT": //dealer Tip
          playingCases[en](data, socket);
          break;

        case "CSL": //chips store list
          chipStoreCases[en](data, socket);
          break;
        case "COSL": //coin store list
          coinStoreCases[en](data, socket);
          break;
        case "CIAP": //check inapppurchase
          coinStoreCases[en](data, socket);
          break;
        case "CIAP2": //check inapppurchase
          coinStoreCases[en](data, socket);
          break;

        case "LB": //leaderboard
          userSettingCases[en](data, socket);
          break;
        case "DB": //Daily bonus
          userSettingCases[en](data, socket);
          break;
        case "DBC": //Daily bonus collect
          userSettingCases[en](data, socket);
          break;
        case "WWC": //weekly winner contest
          userSettingCases[en](data, socket);
          break;
        case "CMB": //collect magic box
          userSettingCases[en](data, socket);
          break;
        case "RSC": //send chips
          userSettingCases[en](data, socket);
          break;
        case "UP": //update profile
          userSettingCases[en](data, socket);
          break;
        case "LC": //Lucky Card
          userSettingCases[en](data, socket);
          break;
        case "EUN": //update user name
          userSettingCases[en](data, socket);
          break;
        case "DL": //dealer list
          userSettingCases[en](data, socket);
          break;
        case "GS": //gift send
          userSettingCases[en](data, socket);
          break;
        case "GL": //gift list
          userSettingCases[en](data, socket);
          break;
        case "CD": //dealer send
          userSettingCases[en](data, socket);
          break;
        case "GSM": //Game send msg
          userSettingCases[en](data, socket);
          break;
        case "URC": //use referral code
          userSettingCases[en](data, socket);
          break;
        case "WRV": //watched reward video
          userSettingCases[en](data, socket);
          break;

        case "FL": //friend list
          friendsCases[en](data, socket);
          break;
        case "AFR": //Action friend request
          friendsCases[en](data, socket);
          break;
        case "SFR": //send friend request
          friendsCases[en](data, socket);
          break;
        case "LFR": //LIST friend request
          friendsCases[en](data, socket);
          break;
        case "BU": //Block user
          friendsCases[en](data, socket);
          break;
        case "UBU": //Block user
          friendsCases[en](data, socket);
          break;
        case "UF": //unfriend
          friendsCases[en](data, socket);
          break;
        case "IF": //invite friend
          friendsCases[en](data, socket);
          break;

        case "NL": //notification list
          notificationCases[en](data, socket);
          break;
        case "NC": //notification count
          notificationCases[en](data, socket);
          break;
        case "SM": //send message
          notificationCases[en](data, socket);
          break;
        case "ASC": //Accept Send Chips
          notificationCases[en](data, socket);
          break;
        case "RN": //remove notification
          notificationCases[en](data, socket);
          break;

        case "HLGFC": //high low get first card
          miniGamesCases[en](data, socket);
          break;
        case "HLNC": //high low next card
          miniGamesCases[en](data, socket);
          break;
        case "ABGFC": //andar bahar get first card
          miniGamesCases[en](data, socket);
          break;
        case "ABUS": //andar bahar user selected ( 1 = anadar, 2 = bahar )
          miniGamesCases[en](data, socket);
          break;
        case "ABCA": //andar bahar chips add
          miniGamesCases[en](data, socket);
          break;
        case "GSC": //get scratch card
          miniGamesCases[en](data, socket);
          break;
        case "SCCA": //scratch card chips add
          miniGamesCases[en](data, socket);
          break;

        case "CH": //chips History
          chipsTrackerCases[en](data, socket);
          break;

        case "TEST":
          cardClass[en](data, socket);
          break;
      }
    });

    socket.on("disconnect", function (data) {
      // printLog("socket disconnect called: ",socket.id);

      var upWhere = { $set: {} };
      upWhere.$set.socketId = "";
      userSettingCases.updateUserDataBySocket(socket.id, upWhere);
    });
  },
};
