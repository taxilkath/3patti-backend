var teenPattiScore = require("teenpattisolver");

//variation : 1 = normal, 2 = Ak47, 3 = Lowest Joker, 4 = Muflis, 5 = 4X Boot Value
module.exports = {
  RL: function (data, socket) {
    var en = data.en;
    if (typeof data.data == "undefined") {
      commonClass.SendData(
        { Message: "RL request is not in data object", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }
    var data = data.data;
    data["en"] = en;

    if (typeof data.user_id == "undefined") {
      commonClass.SendData(
        { Message: "RL user_id is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    if (typeof data.roomId == "undefined") {
      commonClass.SendData(
        { Message: "RL roomId is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    var roomId = objectId(data.roomId);
    var user_id = objectId(data.user_id);

    tablesManager.GetTableInfo(roomId, function (err, RoomInfo) {
      if (RoomInfo) {
        var type = data.type === undefined ? "remove" : data.type;
        playingCases.removeUser(RoomInfo, user_id, type, socket);
      } else {
        commonClass.SendData({ en: "RL", sc: 1 }, socket.id);
      }
    });
  },
  RJ: function (data, socket) {
    // printLog('rj called');

    var en = data.en;
    if (typeof data.data == "undefined") {
      commonClass.SendData(
        { Message: "RJ request is not in data object", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }
    var data = data.data;
    data["en"] = en;

    if (typeof data.user_id == "undefined") {
      commonClass.SendData(
        { Message: "RJ user_id is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    if (typeof data.roomId == "undefined") {
      commonClass.SendData(
        { Message: "RJ roomId is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    if (typeof data.rjtype == "undefined") {
      commonClass.SendData(
        { Message: "RJ rjtype is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    var user_id = objectId(data.user_id);
    var roomId = objectId(data.roomId);
    var rjtype = data.rjtype;

    db.collection("tbl_room").findOne(
      { _id: roomId },
      function (err, RoomInfo) {
        if (RoomInfo) {
          if (RoomInfo.players[user_id]) {
            socket.join(RoomInfo._id);

            if (rjtype == "join") {
              var setobj = {};
              setobj["players." + user_id + ".playerInfo.clientId"] = socket.id;
              tablesManager.RoomUpdate(
                RoomInfo._id,
                { $set: setobj },
                function (err, updateRoomData) {
                  var timediff = require("timediff");
                  var last_update = RoomInfo.utime;
                  var startTime = new Date(Date.now());
                  var diff = timediff(last_update, startTime, "s");
                  diff["totalMilli"] = config.GAME_TURN_TIMER;
                  if (config.GAME_TURN_TIMER < diff.milliseconds) {
                    diff["milliseconds"] = config.GAME_TURN_TIMER;
                  }

                  commonClass.SendData(
                    {
                      data: RoomInfo,
                      time: diff,
                      rejoin: true,
                      en: "JT",
                      sc: 1,
                    },
                    socket.id
                  );
                }
              );
            } else {
              commonClass.SendData(
                { data: RoomInfo, en: "JT", sc: 1 },
                socket.id
              );
            }
          } else {
            commonClass.SendData(
              {
                Message:
                  "You are removed from playing as you didn't take turn 3 times.",
                en: "RL",
                sc: 1,
              },
              socket.id
            );
          }
        } else {
          commonClass.SendData({ en: "RL", sc: 1 }, socket.id);
        }
      }
    );
  },
  TT: function (data, socket) {
    var en = data.en;
    if (typeof data.data == "undefined") {
      commonClass.SendData(
        { Message: "TT request is not in data object", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }
    var data = data.data;
    data["en"] = en;

    if (typeof data.user_id == "undefined") {
      commonClass.SendData(
        { Message: "TT user_id is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    if (typeof data.roomId == "undefined") {
      commonClass.SendData(
        { Message: "TT roomId is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    if (typeof data.ttype == "undefined") {
      commonClass.SendData(
        { Message: "TT ttype is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    if (typeof data.betamount == "undefined") {
      commonClass.SendData(
        { Message: "TT betamount is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    var roomId = objectId(data.roomId);
    var user_id = objectId(data.user_id);
    var ttype = data.ttype; // 1=chall, 2=blind
    var betamount = parseInt(data.betamount);

    playingCases.turnManage(roomId, user_id, ttype, betamount, socket);
  },
  SC: function (data, socket) {
    var en = data.en;
    if (typeof data.data == "undefined") {
      commonClass.SendData(
        { Message: "SC request is not in data object", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }
    var data = data.data;
    data["en"] = en;

    if (typeof data.user_id == "undefined") {
      commonClass.SendData(
        { Message: "SC user_id is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    if (typeof data.roomId == "undefined") {
      commonClass.SendData(
        { Message: "SC roomId is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    var roomId = objectId(data.roomId);
    var user_id = objectId(data.user_id);

    tablesManager.GetTableInfo(roomId, function (err, RoomInfo) {
      if (RoomInfo) {
        var where = {};
        var setobj = {};

        where["_id"] = RoomInfo._id;
        where["players." + user_id + ".isSideShowAvailable"] = {
          $exists: true,
        };

        setobj["players." + user_id + ".isSideShowAvailable"] = true;

        db.collection("tbl_room").updateOne(
          where,
          { $set: setobj },
          function (err, updateRoomData) {
            try {
              commonClass.SendData(
                {
                  data: {
                    slot: RoomInfo.players[user_id].slot,
                    card: RoomInfo.players[user_id].playerInfo.cards,
                  },
                  en: data.en,
                  sc: 1,
                },
                RoomInfo._id
              ); //Next Turn
            } catch (err) {}
          }
        );
      }
    });
  },
  PACK: function (data, socket) {
    var en = data.en;
    if (typeof data.data == "undefined") {
      commonClass.SendData(
        { Message: "PACK request is not in data object", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }
    var data = data.data;
    data["en"] = en;

    if (typeof data.user_id == "undefined") {
      commonClass.SendData(
        { Message: "PACK user_id is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    if (typeof data.roomId == "undefined") {
      commonClass.SendData(
        { Message: "PACK roomId is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    var roomId = objectId(data.roomId);
    var user_id = objectId(data.user_id);

    tablesManager.GetTableInfo(roomId, function (err, RoomInfo) {
      if (RoomInfo) {
        timerClass.cancelTimerV2(
          RoomInfo._id,
          RoomInfo.timerid,
          function (cancleData) {
            playingCases.userPack(RoomInfo, user_id, "click", socket);
          }
        );
      }
    });
  },
  SHOW: function (data, socket) {
    var en = data.en;
    if (typeof data.data == "undefined") {
      commonClass.SendData(
        { Message: "SHOW request is not in data object", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }
    var data = data.data;
    data["en"] = en;

    if (typeof data.user_id == "undefined") {
      commonClass.SendData(
        { Message: "SHOW user_id is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    if (typeof data.roomId == "undefined") {
      commonClass.SendData(
        { Message: "SHOW roomId is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    if (typeof data.betamount == "undefined") {
      commonClass.SendData(
        { Message: "SHOW betamount is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    var roomId = objectId(data.roomId);
    var user_id = objectId(data.user_id);
    var betamount = parseInt(data.betamount);

    playingCases.showAction(roomId, user_id, betamount, socket);
  },
  SS: function (data, socket) {
    var en = data.en;
    if (typeof data.data == "undefined") {
      commonClass.SendData(
        { Message: "SS request is not in data object", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }
    var data = data.data;
    data["en"] = en;

    if (typeof data.user_id == "undefined") {
      commonClass.SendData(
        { Message: "SS user_id is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    if (typeof data.user_id == "undefined") {
      commonClass.SendData(
        { Message: "SS other_id is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    if (typeof data.roomId == "undefined") {
      commonClass.SendData(
        { Message: "SS roomId is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    if (typeof data.betamount == "undefined") {
      commonClass.SendData(
        { Message: "SS betamount is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    var roomId = objectId(data.roomId);
    var user_id = objectId(data.user_id);
    var other_id = objectId(data.other_id);
    var betamount = parseInt(data.betamount);

    tablesManager.GetTableInfo(roomId, function (err, RoomInfo) {
      if (RoomInfo && RoomInfo.players[user_id]) {
        if (RoomInfo.players[user_id].playerInfo.chips >= betamount) {
          var activePlayers = playingCases.getActivePlayersCount(
            RoomInfo.players
          );
          if (activePlayers > 2) {
            var setobj = {},
              inc = {};
            inc["amount"] = betamount;
            setobj["lastBet"] = betamount;
            inc["players." + user_id + ".playerInfo.chips"] = -betamount;
            inc["players." + user_id + ".achips"] = -betamount;
            setobj["players." + user_id + ".timeout"] = false;
            setobj["cstatus"] = "SS";

            /*##################update user chips, cwchips########################################*/
            chipsTrackerCases.insert(
              {
                chips: -betamount,
                type: "debit",
                msg: "sideshow",
                ct: "chips",
                uid: user_id,
              },
              ""
            );
            if (RoomInfo.itrmnt == false) {
              db.collection("game_users").updateOne(
                { _id: user_id },
                { $inc: { chips: -betamount, cwchips: -betamount } },
                function (err, resultjnk) {
                  if (err) {
                    printLog("err13");
                    printLog(err);
                  }
                }
              );
            }
            /*#######################################################################################################*/

            tablesManager.RoomFindUpdate(
              RoomInfo._id,
              { $set: setobj, $inc: inc },
              function (err, updateRoomData) {
                if (err) {
                  printLog("err14");
                  printLog(err);
                }

                if (RoomInfo.players[user_id] && RoomInfo.players[other_id]) {
                  commonClass.SendData(
                    {
                      data: {
                        from: RoomInfo.players[user_id].slot,
                        to: RoomInfo.players[other_id].slot,
                        betamount: betamount,
                        amount: RoomInfo.amount,
                        puc: RoomInfo.players[user_id].playerInfo.chips,
                      },
                      en: data.en,
                      sc: 1,
                    },
                    RoomInfo._id
                  );
                }
              }
            );
          }
        } else {
          try {
            commonClass.SendData(
              { Message: "you don't have enough chips.", en: "TT", sc: 501 },
              socket.id
            );
            return false;
          } catch (e) {}
        }
      }
    });
  },
  SSA: function (data, socket) {
    var en = data.en;
    if (typeof data.data == "undefined") {
      commonClass.SendData(
        { Message: "SSA request is not in data object", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }
    var data = data.data;
    data["en"] = en;

    if (typeof data.user_id == "undefined") {
      commonClass.SendData(
        { Message: "SSA user_id is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    if (typeof data.other_id == "undefined") {
      commonClass.SendData(
        { Message: "SSA other_id is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    if (typeof data.roomId == "undefined") {
      commonClass.SendData(
        { Message: "SSA roomId is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    if (typeof data.isAccept == "undefined") {
      commonClass.SendData(
        { Message: "SSA isAccept is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    var roomId = objectId(data.roomId);
    var user_id = objectId(data.user_id);
    var other_id = objectId(data.other_id);

    tablesManager.GetTableInfo(roomId, function (err, RoomInfo) {
      if (RoomInfo) {
        timerClass.cancelTimerV2(
          RoomInfo._id,
          RoomInfo.timerid,
          function (cancleData) {
            var setobj = {};
            var activePlayers = playingCases.getActivePlayersCount(
              RoomInfo.players
            );
            var other_id_slot = RoomInfo.players[other_id].slot;
            var user_id_slot = RoomInfo.players[user_id].slot;
            if (data.isAccept == 1 && activePlayers > 2) {
              var winnerInfo = playingCases.decideWinnerSideShow(
                RoomInfo.players,
                user_id,
                other_id,
                RoomInfo.variation
              );

              if (winnerInfo != undefined) {
                if (RoomInfo.players[user_id] && RoomInfo.players[other_id]) {
                  if (user_id.toString() == winnerInfo.winner.id.toString()) {
                    setobj["players." + other_id + ".packed"] = true;
                    var pslot = RoomInfo.players[other_id].slot;
                    var un = RoomInfo.players[user_id].playerInfo.un;
                  } else {
                    setobj["players." + user_id + ".packed"] = true;
                    var pslot = RoomInfo.players[user_id].slot;
                    var un = RoomInfo.players[other_id].playerInfo.un;
                  }

                  commonClass.SendData(
                    {
                      data: {
                        from: other_id_slot,
                        to: user_id_slot,
                        isAccept: data.isAccept,
                        slot: winnerInfo.winner.slot,
                        card: winnerInfo.card,
                        msg: un + " won sideshow.",
                      },
                      en: data.en,
                      sc: 1,
                    },
                    RoomInfo._id
                  );

                  setTimeout(function () {
                    commonClass.SendData(
                      { data: { slot: pslot }, en: "PACK", sc: 1 },
                      RoomInfo._id
                    );
                  }, 1000);
                }
              }
            } else {
              commonClass.SendData(
                {
                  data: {
                    from: other_id_slot,
                    to: user_id_slot,
                    isAccept: data.isAccept,
                    msg:
                      RoomInfo.players[user_id].playerInfo.un +
                      " declined sideshow request.",
                  },
                  en: data.en,
                  sc: 1,
                },
                RoomInfo._id
              );
            }

            setobj["players." + other_id + ".turn"] = false;
            setobj["players." + other_id + ".timeout"] = true;
            setobj["utime"] = new Date(Date.now());

            tablesManager.RoomFindUpdate(
              RoomInfo._id,
              { $set: setobj },
              function (err, updateRoomData) {
                if (!err) {
                  var RoomInfo = updateRoomData.value;
                  var nextTurn = playingCases.getNextActivePlayer(
                    RoomInfo,
                    other_id,
                    "100"
                  );
                  var setobj = {};
                  setobj["players." + nextTurn.uid + ".turn"] = true;

                  tablesManager.RoomUpdate(
                    RoomInfo._id,
                    { $set: setobj },
                    function (err, updateRoomDatav1) {
                      timerClass.NextTurnTimerV2(
                        RoomInfo._id,
                        nextTurn.uid,
                        socket,
                        function (data) {
                          commonClass.SendData(
                            {
                              data: {
                                slot: nextTurn.slot,
                                time: config.GAME_TURN_TIMER,
                                lastBet: RoomInfo.lastBet,
                                lastBlind: RoomInfo.lastBlind,
                                amount: RoomInfo.amount,
                              },
                              en: "NT",
                              sc: 1,
                            },
                            RoomInfo._id
                          ); //Next Turn
                        }
                      );
                    }
                  );
                }
              }
            );
          }
        );
      }
    });
  },
  SV: function (data, socket) {
    var en = data.en;
    if (typeof data.data == "undefined") {
      commonClass.SendData(
        { Message: "SV request is not in data object", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }
    var data = data.data;
    data["en"] = en;

    if (typeof data.user_id == "undefined") {
      commonClass.SendData(
        { Message: "SV user_id is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    if (typeof data.roomId == "undefined") {
      commonClass.SendData(
        { Message: "SV roomId is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    if (typeof data.variation == "undefined") {
      commonClass.SendData(
        { Message: "SV variation is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    if (typeof data.vname == "undefined") {
      commonClass.SendData(
        { Message: "SV vname is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    var roomId = objectId(data.roomId);
    var user_id = objectId(data.user_id);

    tablesManager.GetTableInfo(roomId, function (err, RoomInfo) {
      if (RoomInfo) {
        timerClass.cancelTimerV2(
          RoomInfo._id,
          RoomInfo.timerid,
          function (cancleData) {
            if (playingCases.getPlayersCount(RoomInfo.players) > 1) {
              let setobj = {};
              setobj["variation"] = data.variation;

              commonClass.SendData(
                {
                  data: {
                    variation: data.variation,
                    vname: data.vname,
                  },
                  en: "SVA",
                  sc: 1,
                },
                RoomInfo._id
              );

              tablesManager.RoomFindUpdate(
                RoomInfo._id,
                { $set: setobj },
                function (err, updateRoomData) {
                  playingCases.collectBootAmount(
                    updateRoomData.value,
                    function (res) {}
                  );
                }
              );
            }
          }
        );
      }
    });
  },
  SU: function (data, socket) {
    var en = data.en;
    if (typeof data.data == "undefined") {
      commonClass.SendData(
        { Message: "SU request is not in data object", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }
    var data = data.data;
    data["en"] = en;

    if (typeof data.user_id == "undefined") {
      commonClass.SendData(
        { Message: "SU user_id is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    if (typeof data.roomId == "undefined") {
      commonClass.SendData(
        { Message: "SU roomId is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    var roomId = objectId(data.roomId);
    var user_id = objectId(data.user_id);

    tablesManager.GetTableInfo(roomId, function (err, RoomInfo) {
      if (RoomInfo && RoomInfo.players[user_id]) {
        var unset = {},
          inc = {};
        unset["players." + user_id] = "";
        inc["tp"] = -1;

        var total_player = playingCases.getPlayersCount(RoomInfo.players);
        var nextTurn = playingCases.getNextActivePlayer(
          RoomInfo,
          user_id,
          "110"
        );
        var userSlot = RoomInfo.players[user_id].slot;
        var isCurrentUserTurn = RoomInfo.players[user_id].turn;
        RoomInfo.availableSlot[userSlot] = userSlot;

        var bchips = RoomInfo.players[user_id].bchips;
        var achips = RoomInfo.players[user_id].achips;

        tablesManager.RoomFindUpdate(
          roomId,
          {
            $unset: unset,
            $inc: inc,
            $set: { availableSlot: RoomInfo.availableSlot },
          },
          function (err, updateRoomData) {
            if (err) {
              printLog("err15");
              printLog(err);
            }
            if (!err) {
              var RoomInfo = updateRoomData.value;

              if (total_player > 1) {
                if (isCurrentUserTurn) {
                  timerClass.cancelTimerV2(
                    RoomInfo._id,
                    RoomInfo.timerid,
                    function (cancleData) {
                      var setobj = {};
                      setobj["players." + nextTurn.uid + ".turn"] = true;
                      tablesManager.RoomUpdate(
                        RoomInfo._id,
                        { $set: setobj },
                        function (err, updateRoomData) {
                          playingCases.ResponseSU(
                            userSlot,
                            achips - bchips,
                            roomId
                          );
                          playingCases.nextTurn(RoomInfo, nextTurn, socket);
                        }
                      );
                    }
                  );
                } else {
                  playingCases.ResponseSU(userSlot, achips - bchips, roomId);
                }
              } else {
                playingCases.ResponseSU(userSlot, achips - bchips, roomId);

                var ActivePlayers = playingCases.getActivePlayersCount(
                  RoomInfo.players
                );
                if (ActivePlayers == 1 && RoomInfo.igs == true) {
                  var setobj = {},
                    inc = {};
                  timerClass.cancelTimerV2(
                    RoomInfo._id,
                    RoomInfo.timerid,
                    function (cancleData) {
                      setobj["igs"] = false;
                      setobj["lastBet"] = 0;
                      setobj["amount"] = 0;
                      setobj["lastBlind"] = true;
                      // setobj['players'] = Players;
                      setobj["timerType"] = "win";

                      var winuser = playingCases.getActivePlayers(Players);
                      var tblAmount = RoomInfo.amount;
                      if (winuser != undefined) {
                        inc["players." + winuser.uid + ".playerInfo.chips"] =
                          RoomInfo.amount;
                        inc["players." + winuser.uid + ".achips"] =
                          RoomInfo.amount;
                        inc["players." + winuser.uid + ".tgw"] = 1;
                        setobj["players." + winuser.uid + ".turn"] = false;

                        tablesManager.RoomFindUpdate(
                          RoomInfo._id,
                          { $set: setobj, $inc: inc },
                          function (err, RoomInfo) {
                            if (err) {
                              printLog("err16");
                              printLog(err);
                            }
                            if (RoomInfo) {
                              var RoomInfo = RoomInfo.value;
                              var totalGamePlayer =
                                playingCases.getPlayersCount(RoomInfo.players);
                              var totalGameRobot = playingCases.getRobotCount(
                                RoomInfo.players
                              );
                              var clients = playingCases.RoomConnectedSocket(
                                RoomInfo._id,
                                socket
                              );

                              if (
                                totalGameRobot == totalGamePlayer &&
                                clients == undefined
                              ) {
                                db.collection("tbl_room").deleteOne({
                                  _id: RoomInfo._id,
                                });
                              } else {
                                var total_player =
                                  playingCases.getActivePlayersCount(
                                    RoomInfo.players
                                  );

                                if (total_player == 1) {
                                  if (winuser != undefined) {
                                    winAmount =
                                      RoomInfo.players[winuser.uid].playerInfo
                                        .chips;
                                    commonClass.SendData(
                                      {
                                        data: {
                                          slot: winuser.slot,
                                          chips: winAmount,
                                          wid: winuser.uid,
                                        },
                                        en: "WIN",
                                        sc: 1,
                                      },
                                      RoomInfo._id
                                    );

                                    /*##################update user chips, cwchips and game play(gp)########################################*/
                                    chipsTrackerCases.insert(
                                      {
                                        chips: tblAmount,
                                        type: "credit",
                                        msg: "win",
                                        ct: "chips",
                                        uid: winuser.uid,
                                      },
                                      ""
                                    );
                                    if (RoomInfo.itrmnt == false) {
                                      db.collection("game_users").updateOne(
                                        { _id: winuser.uid },
                                        {
                                          $inc: {
                                            chips: tblAmount,
                                            cwchips: tblAmount,
                                            "result.gw": 1,
                                          },
                                        },
                                        function (err, resultjnk) {
                                          if (err) {
                                            printLog("err17");
                                            printLog(err);
                                          }
                                        }
                                      );
                                    }
                                    /*#######################################################################################################*/
                                  }

                                  var ActivePlayers =
                                    playingCases.getPlayersCount(
                                      RoomInfo.players
                                    );
                                  if (ActivePlayers > 1) {
                                    timerClass.WinnerTimer(
                                      RoomInfo._id,
                                      socket,
                                      function (wtdata) {}
                                    );
                                  } else {
                                    var upWhere = { $set: {} };
                                    upWhere.$set.timerType = "";
                                    tablesManager.RoomUpdate(
                                      RoomInfo._id,
                                      upWhere
                                    );
                                  }
                                }
                              }
                            }
                          }
                        );
                      }
                    }
                  );
                }
              }
            } else {
              printLog("err18");
              printLog(err);
            }
          }
        );
      } else {
        // printLog('not found');
      }
    });
  },
  DT: function (data, socket) {
    var en = data.en;
    if (typeof data.data == "undefined") {
      commonClass.SendData(
        { Message: "DT request is not in data object", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }
    var data = data.data;
    data["en"] = en;

    if (typeof data.user_id == "undefined") {
      commonClass.SendData(
        { Message: "DT user_id is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    if (typeof data.roomId == "undefined") {
      commonClass.SendData(
        { Message: "DT roomId is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    if (typeof data.tip == "undefined") {
      commonClass.SendData(
        { Message: "DT tip is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    var roomId = objectId(data.roomId);
    var user_id = objectId(data.user_id);
    var tip = data.tip;

    tablesManager.GetTableInfo(roomId, function (err, RoomInfo) {
      if (RoomInfo && RoomInfo.players[user_id]) {
        var userChips = RoomInfo.players[user_id].playerInfo.chips;
        if (userChips > tip) {
          /*##################update user chips, cwchips########################################*/
          chipsTrackerCases.insert(
            {
              chips: -tip,
              type: "debit",
              msg: "dealertip",
              ct: "chips",
              uid: user_id,
            },
            ""
          );
          if (RoomInfo.itrmnt == false) {
            db.collection("game_users").updateOne(
              { _id: user_id },
              { $inc: { chips: -tip, cwchips: -tip } },
              function (err, resultjnk) {
                if (err) {
                  printLog("err19");
                  printLog(err);
                }
              }
            );
          }
          /*#######################################################################################################*/

          var inc = {};
          inc["players." + user_id + ".playerInfo.chips"] = -tip;
          inc["players." + user_id + ".achips"] = -tip;

          tablesManager.RoomFindUpdate(
            RoomInfo._id,
            { $inc: inc },
            function (err, updateRoomData) {
              var RoomInfo = updateRoomData.value;

              commonClass.SendData(
                {
                  data: {
                    user_id: user_id,
                    tip: tip,
                    userChips: RoomInfo.players[user_id].playerInfo.chips,
                  },
                  en: data.en,
                  sc: 1,
                },
                RoomInfo._id
              ); //Next Turn
            }
          );
        } else {
          commonClass.SendData(
            { Message: "you don't have enough chips.", en: "TT", sc: 501 },
            socket.id
          );
          return false;
        }
      }
    });
  },
  showAction: function (roomId, user_id, betamount, socket) {
    tablesManager.GetTableInfo(roomId, function (err, RoomInfo) {
      if (RoomInfo) {
        if (
          RoomInfo.players[user_id] &&
          (RoomInfo.players[user_id].playerInfo.chips >= betamount ||
            RoomInfo.itrmnt == true)
        ) {
          timerClass.cancelTimerV2(
            RoomInfo._id,
            RoomInfo.timerid,
            function (cancleData) {
              var activePlayers = playingCases.getActivePlayersCount(
                RoomInfo.players
              );
              if (activePlayers == 2 || RoomInfo.itrmnt == true) {
                var setobj = {},
                  inc = {};
                inc["amount"] = betamount;
                setobj["lastBet"] = betamount;
                inc["players." + user_id + ".playerInfo.chips"] = -betamount;
                inc["players." + user_id + ".lastBet"] = betamount;
                inc["players." + user_id + ".tblind"] = 1;
                inc["players." + user_id + ".achips"] = -betamount;
                setobj["players." + user_id + ".turn"] = false;
                setobj["players." + user_id + ".tt"] = 0;
                setobj["utime"] = new Date(Date.now());

                /*##################update user chips, cwchips########################################*/
                chipsTrackerCases.insert(
                  {
                    chips: -betamount,
                    type: "debit",
                    msg: "show",
                    ct: "chips",
                    uid: user_id,
                  },
                  ""
                );
                if (RoomInfo.itrmnt == false) {
                  db.collection("game_users").updateOne(
                    { _id: user_id },
                    { $inc: { chips: -betamount, cwchips: -betamount } },
                    function (err, resultjnk) {
                      if (err) {
                        printLog("err20");
                        printLog(err);
                      }
                    }
                  );
                }
                /*#######################################################################################################*/

                tablesManager.RoomFindUpdate(
                  RoomInfo._id,
                  { $set: setobj, $inc: inc },
                  function (err, updateRoomData) {
                    if (updateRoomData.value) {
                      var RoomInfo = updateRoomData.value;
                      var WinAmount = RoomInfo.amount;
                      commonClass.SendData(
                        {
                          data: {
                            lastBet: RoomInfo.lastBet,
                            lastBlind: RoomInfo.lastBlind,
                            pslot: RoomInfo.players[user_id].slot,
                            puc: RoomInfo.players[user_id].playerInfo.chips, //user chips
                            pbetamount: betamount,
                            amount: RoomInfo.amount,
                          },
                          en: "NT",
                          sc: 1,
                        },
                        RoomInfo._id
                      ); //Next Turn

                      var winnerInfo = playingCases.decideWinner(
                        RoomInfo.players,
                        RoomInfo.variation
                      );
                      if (winnerInfo != undefined) {
                        let inc = {},
                          setobj = {};
                        inc[
                          "players." +
                            winnerInfo.winner.id +
                            ".playerInfo.chips"
                        ] = RoomInfo.amount;
                        inc["players." + winnerInfo.winner.id + ".achips"] =
                          RoomInfo.amount;
                        inc["players." + winnerInfo.winner.id + ".tgw"] = 1;

                        setobj["lastBet"] = 0;
                        setobj["amount"] = 0;
                        setobj["lastBlind"] = true;
                        setobj["igs"] = false;

                        tablesManager.RoomFindUpdate(
                          RoomInfo._id,
                          { $set: setobj, $inc: inc },
                          function (err, RoomInfos) {
                            if (RoomInfos.value) {
                              var RoomInfo = RoomInfos.value;
                              var winAmount =
                                RoomInfo.players[winnerInfo.winner.id]
                                  .playerInfo.chips;

                              /*##################update user chips, cwchips and game play(gp)########################################*/
                              chipsTrackerCases.insert(
                                {
                                  chips: WinAmount,
                                  type: "credit",
                                  msg: "win",
                                  ct: "chips",
                                  uid: winnerInfo.winner.id,
                                },
                                ""
                              );
                              if (RoomInfo.itrmnt == false) {
                                db.collection("game_users").updateOne(
                                  { _id: winnerInfo.winner.id },
                                  {
                                    $inc: {
                                      chips: WinAmount,
                                      cwchips: WinAmount,
                                      "result.gw": 1,
                                    },
                                  },
                                  function (err, resultjnk) {
                                    if (err) {
                                      printLog("err22");
                                      printLog(err);
                                    }
                                  }
                                );
                              }
                              /*#######################################################################################################*/

                              setTimeout(function () {
                                commonClass.SendData(
                                  {
                                    data: {
                                      slot: winnerInfo.winner.slot,
                                      chips: winAmount,
                                      card: winnerInfo.card,
                                      wid: winnerInfo.winner.id,
                                      sid: user_id,
                                    },
                                    en: "WIN",
                                    sc: 1,
                                  },
                                  RoomInfo._id
                                );
                              }, 1000);

                              var ActivePlayers = playingCases.getPlayersCount(
                                RoomInfo.players
                              );
                              if (ActivePlayers > 1) {
                                timerClass.WinnerTimer(
                                  RoomInfo._id,
                                  socket,
                                  function (wtdata) {}
                                );
                              }
                            }
                          }
                        );
                      }
                    }
                  }
                );
              }
            }
          );
        } else {
          if (
            RoomInfo.players[user_id] &&
            RoomInfo.players[user_id].is_robot == false
          ) {
            commonClass.SendData(
              { Message: "you don't have enough chips.", en: "TT", sc: 501 },
              socket.id
            );
            return false;
          }
        }
      }
    });
  },
  turnManage: function (roomId, user_id, ttype, betamount, socket) {
    tablesManager.GetTableInfo(roomId, function (err, RoomInfo) {
      if (RoomInfo) {
        if (
          RoomInfo.players[user_id] &&
          RoomInfo.players[user_id].playerInfo &&
          RoomInfo.players[user_id].playerInfo.chips >= betamount
        ) {
          timerClass.cancelTimerV2(
            RoomInfo._id,
            RoomInfo.timerid,
            function (cancleData) {
              var nextTurn = playingCases.getNextActivePlayer(
                RoomInfo,
                user_id,
                "101"
              );

              var setobj = {},
                inc = {};
              inc["amount"] = betamount;
              setobj["lastBet"] = betamount;
              inc["players." + user_id + ".playerInfo.chips"] = -betamount;
              inc["players." + user_id + ".lastBet"] = betamount;
              inc["players." + user_id + ".achips"] = -betamount;
              setobj["players." + user_id + ".turn"] = false;
              setobj["players." + user_id + ".tt"] = 0;
              setobj["players." + nextTurn.uid + ".turn"] = true;
              setobj["lastBlind"] = ttype == 1 ? false : true;
              setobj["utime"] = new Date(Date.now());

              if (ttype == 1) {
                inc["players." + user_id + ".tchaal"] = 1;
              } else if (ttype == 2) {
                inc["players." + user_id + ".tblind"] = 1;
              }

              if (
                RoomInfo.players[user_id].is_robot &&
                RoomInfo.players[user_id].tblind == 4
              ) {
                setobj["players." + user_id + ".isSideShowAvailable"] = true;
              }
              /*##################update user chips, cwchips########################################*/
              chipsTrackerCases.insert(
                {
                  chips: -betamount,
                  type: "debit",
                  msg: "turn",
                  ct: "chips",
                  uid: user_id,
                },
                ""
              );
              if (RoomInfo.itrmnt == false) {
                db.collection("game_users").updateOne(
                  { _id: user_id },
                  { $inc: { chips: -betamount, cwchips: -betamount } },
                  function (err, resultjnk) {
                    if (err) {
                      printLog("err23");
                      printLog(err);
                    }
                  }
                );
              }
              /*#######################################################################################################*/

              tablesManager.RoomFindUpdate(
                RoomInfo._id,
                { $set: setobj, $inc: inc },
                function (err, updateRoomData) {
                  if (updateRoomData.value) {
                    var RoomInfo = updateRoomData.value;

                    var tblAmount = updateRoomData.value.amount;
                    var tblpot = updateRoomData.value.tinfo.tblpot;
                    if (tblAmount >= tblpot) {
                      var winnerInfo = playingCases.decideWinner(
                        RoomInfo.players,
                        RoomInfo.variation
                      );

                      if (winnerInfo != undefined) {
                        let setobj = {},
                          inc = {};
                        setobj["igs"] = false;
                        setobj["lastBet"] = 0;
                        setobj["amount"] = 0;
                        setobj["lastBlind"] = true;

                        var winAmount = RoomInfo.amount;
                        inc[
                          "players." +
                            winnerInfo.winner.id +
                            ".playerInfo.chips"
                        ] = winAmount;
                        inc["players." + winnerInfo.winner.id + ".achips"] =
                          winAmount;
                        inc["players." + winnerInfo.winner.id + ".tgw"] = 1;

                        tablesManager.RoomFindUpdate(
                          RoomInfo._id,
                          { $set: setobj, $inc: inc },
                          function (err, RoomInfos) {
                            if (err) {
                              printLog("err24");
                              printLog(err);
                            }

                            var RoomInfo = RoomInfos.value;
                            /*##################update user chips, cwchips and game play(gp)########################################*/
                            chipsTrackerCases.insert(
                              {
                                chips: winAmount,
                                type: "credit",
                                msg: "win",
                                ct: "chips",
                                uid: winnerInfo.winner.id,
                              },
                              ""
                            );
                            if (RoomInfo.itrmnt == false) {
                              db.collection("game_users").updateOne(
                                { _id: winnerInfo.winner.id },
                                {
                                  $inc: {
                                    chips: winAmount,
                                    cwchips: winAmount,
                                    "result.gw": 1,
                                  },
                                },
                                function (err, udata) {
                                  if (err) {
                                    printLog("err25");
                                    printLog(err);
                                  }
                                }
                              );
                            }
                            /*#######################################################################################################*/

                            var winUserAmount =
                              RoomInfo.players[winnerInfo.winner.id].playerInfo
                                .chips;

                            setTimeout(function () {
                              commonClass.SendData(
                                {
                                  data: {
                                    slot: winnerInfo.winner.slot,
                                    chips: winUserAmount,
                                    card: winnerInfo.card,
                                    wid: winnerInfo.winner.id,
                                    lt: RoomInfo.players[user_id].slot,
                                    pbetamount: betamount,
                                    amount: tblAmount,
                                    type: "potlimit",
                                  },
                                  en: "WIN",
                                  sc: 1,
                                },
                                RoomInfo._id
                              );
                            }, 1500);

                            var ActivePlayers = playingCases.getPlayersCount(
                              RoomInfo.players
                            );
                            if (ActivePlayers > 1) {
                              timerClass.WinnerTimer(
                                RoomInfo._id,
                                socket,
                                function (wtdata) {}
                              );
                            }
                          }
                        );
                      }
                    } else {
                      var ActivePlayers = playingCases.getPlayersCount(
                        RoomInfo.players
                      );
                      if (ActivePlayers > 1) {
                        if (nextTurn.is_robot) {
                          playingCases.ResponseNT(
                            RoomInfo,
                            user_id,
                            nextTurn,
                            betamount
                          );
                          autoCases.robotTurn(RoomInfo, nextTurn, socket);
                        } else {
                          timerClass.NextTurnTimerV2(
                            RoomInfo._id,
                            nextTurn.uid,
                            socket,
                            function (data12) {
                              playingCases.ResponseNT(
                                RoomInfo,
                                user_id,
                                nextTurn,
                                betamount
                              );
                            }
                          );
                        }
                      }
                    }
                  }
                }
              );
            }
          );
        } else {
          try {
            commonClass.SendData(
              { Message: "you don't have enough chips.", en: "TT", sc: 501 },
              socket.id
            );
            return false;
          } catch (e) {}
        }
      } else {
        try {
          commonClass.SendData(
            { Message: "room not found", en: "TT", sc: 0 },
            socket.id
          );
          return false;
        } catch (e) {}
      }
    });
  },
  gameStart: function (roomId, socket) {
    tablesManager.GetTableInfo(roomId, function (err, roomInfo) {
      if (roomInfo && playingCases.getPlayersCount(roomInfo.players) > 1) {
        var players = playingCases.resetAllPlayers(roomInfo.players);

        let setobj = {};
        setobj["lastBet"] = 0;
        setobj["amount"] = 0;
        setobj["lastBlind"] = true;
        setobj["timerType"] = "";

        if (roomInfo.mode == 2) {
          setobj["variation"] = 1;
          roomInfo.tinfo.tblbet_value = roomInfo.tinfo.tblbet_value * 4; //if user select 4x
        }

        var total_player = 0;

        _.forOwn(players, function (value, key) {
          // printLog(players[key].playerInfo.chips);
          if (players[key].playerInfo.chips < roomInfo.tinfo.tblbet_value) {
            // if(roomInfo.itrmnt == true){

            // 	commonClass.SendData({data:{slot:players[key].slot, type:'nochips'},'en':'RL', 'sc':1}, roomInfo._id);

            // }else{

            commonClass.SendData(
              {
                data: { slot: players[key].slot, type: "nochips" },
                en: "RL",
                sc: 1,
              },
              roomInfo._id
            );
            // }

            try {
              var csoket = players[key].playerInfo.clientId;
              var socketss = io.sockets.connected[csoket];
              socketss.leave(roomInfo._id);
            } catch (e) {
              // printLog(e)
            }
            userSettingCases.clearUserRoomData(key);
            roomInfo.availableSlot[players[key].slot] = players[key].slot;
            delete players[key];
          } else {
            total_player++;
          }
        });

        var totalGamePlayer = playingCases.getPlayersCount(players);
        var totalGameRobot = playingCases.getRobotCount(players);

        // printLog('totalGamePlayer>>>>'+totalGamePlayer);
        // printLog('totalGameRobot>>>>'+totalGameRobot);
        var clients = playingCases.RoomConnectedSocket(roomInfo._id, socket);
        // printLog(clients);

        if (totalGameRobot == totalGamePlayer && clients == undefined) {
          db.collection("tbl_room").deleteOne({ _id: roomInfo._id });
        } else {
          setobj["players"] = players;
          setobj["availableSlot"] = roomInfo.availableSlot;
          setobj["tp"] = total_player;

          tablesManager.RoomFindUpdate(
            roomInfo._id,
            { $set: setobj },
            function (err, updateRoomData) {
              if (updateRoomData.value) {
                var total_player = playingCases.getPlayersCount(
                  updateRoomData.value.players
                );
                if (total_player > 1) {
                  var mode = updateRoomData.value.mode;
                  if (mode == 2) {
                    playingCases.selectVariation(updateRoomData.value, socket);
                  } else {
                    playingCases.collectBootAmount(
                      updateRoomData.value,
                      function (res) {}
                    );
                  }
                } else {
                  if (updateRoomData.value.itrmnt == false) {
                    timerClass.otherUserWaitngTimer(
                      updateRoomData.value._id,
                      socket
                    );
                  }
                }
              }
            }
          );
        }
      }
    });
  },
  selectVariation: function (RoomInfo, socket) {
    var deal = playingCases.decideDeal(RoomInfo);
    var turn = playingCases.getNextActivePlayer(RoomInfo, deal.uid, "102");

    commonClass.SendData(
      {
        data: {
          slot: turn.slot,
          variations: RoomInfo.variations,
          time: config.GAME_VARIATION_SELECT_TIMER,
        },
        en: "SV",
        sc: 1,
      },
      RoomInfo._id
    );

    if (turn.is_robot) {
      setTimeout(function () {
        playingCases.autoSelectVariation(RoomInfo._id, turn.uid, socket);
      }, 3000);
    } else {
      timerClass.selectVariation(
        RoomInfo._id,
        turn.uid,
        socket,
        function (data) {}
      );
    }
  },
  autoSelectVariation: function (roomId, currentTurnId, socket) {
    tablesManager.GetTableInfo(roomId, function (err, RoomInfo) {
      if (RoomInfo) {
        if (playingCases.getPlayersCount(RoomInfo.players) > 1) {
          if (
            RoomInfo.players[currentTurnId] &&
            RoomInfo.players[currentTurnId].is_robot
          ) {
            var randomItem =
              config.GAME_VARIATIONS[
                Math.floor(Math.random() * _.size(config.GAME_VARIATIONS))
              ];
            var variation = randomItem.id;
            var vname = randomItem.name;
            // printLog(randomItem);
          } else {
            var variation = 2;
            var vname = "Ak47";
          }

          let setobj = {};
          setobj["variation"] = variation;

          commonClass.SendData(
            {
              data: {
                variation: variation,
                vname: vname,
              },
              en: "SVA",
              sc: 1,
            },
            RoomInfo._id
          );

          tablesManager.RoomFindUpdate(
            RoomInfo._id,
            { $set: setobj },
            function (err, updateRoomData) {
              playingCases.collectBootAmount(
                updateRoomData.value,
                function (res) {}
              );
            }
          );
        }
      }
    });
  },
  collectBootAmount: function (roomInfo) {
    var deal = playingCases.decideDeal(roomInfo);
    var turn = playingCases.getNextActivePlayer(roomInfo, deal.uid, "103");

    if (typeof turn != "undefined") {
      if (roomInfo.mode == 2 && roomInfo.variation == 5) {
        roomInfo.tinfo.tblbet_value = roomInfo.tinfo.tblbet_value * 4;
      }

      var ids = [],
        setobj = {},
        inc = {};
      var activeDealer = playingCases.getDealerPlayer(roomInfo.players);

      if (activeDealer) {
        setobj["players." + activeDealer.uid + ".deal"] = false;
      }

      var players = playingCases.resetAllPlayers(roomInfo.players);
      commonClass.SendData(
        {
          en: "CBV",
          sc: 1,
          BV: roomInfo.tinfo.tblbet_value,
          dealer: deal.slot,
        },
        roomInfo._id
      );

      setobj["players." + deal.uid + ".deal"] = true;
      setobj["players." + turn.uid + ".turn"] = true;
      setobj["igs"] = true;

      _.forOwn(roomInfo.players, function (value, key) {
        ids.push(objectId(key));
        inc["players." + key + ".playerInfo.chips"] =
          -roomInfo.tinfo.tblbet_value;
        inc["players." + key + ".tgp"] = 1;
        inc["players." + key + ".achips"] = -roomInfo.tinfo.tblbet_value;
        setobj["players." + key + ".active"] = true;

        chipsTrackerCases.insert(
          {
            chips: -roomInfo.tinfo.tblbet_value,
            type: "debit",
            msg: "collectBootAmount",
            ct: "chips",
            uid: key,
          },
          ""
        );
      });

      setobj["amount"] = roomInfo.tinfo.tblbet_value * roomInfo.tp;
      setobj["lastBet"] = roomInfo.tinfo.tblbet_value;

      if (roomInfo.itrmnt == false) {
        /*##################update user chips, cwchips and game play(gp)########################################*/
        db.collection("game_users").updateMany(
          { _id: { $in: ids } },
          {
            $inc: {
              chips: -roomInfo.tinfo.tblbet_value,
              "result.gp": 1,
              cwchips: -roomInfo.tinfo.tblbet_value,
            },
          },
          function (err, resultjnk) {
            if (err) {
              printLog("err26");
              printLog(err);
            }
          }
        );
        /*#######################################################################################################*/
      }

      tablesManager.RoomFindUpdate(
        roomInfo._id,
        { $set: setobj, $inc: inc },
        function (err, res) {
          var RoomInfo = res.value;
          if (RoomInfo) {
            var ActivePlayers = playingCases.getActivePlayersCount(
              RoomInfo.players
            );
            if (ActivePlayers > 1 && RoomInfo.igs == true) {
              // playingCases.addUserPlayMatch(roomInfo.players, roomInfo._id);

              timerClass.cardDistributeTimer(roomInfo._id);
            }
          }
        }
      );
    }
  },
  distributeCards: function (roomId, socket) {
    tablesManager.GetTableInfo(roomId, function (err, roomInfo) {
      if (roomInfo) {
        var ActivePlayers = playingCases.getActivePlayersCount(
          roomInfo.players
        );
        if (ActivePlayers > 1 && roomInfo.igs == true) {
          var pack = cardClass.createPack();
          var myPack = cardClass.shufflePack(pack);
          var setobj = {};

          _.forOwn(roomInfo.players, function (value, key) {
            var card = cardClass.draw(myPack, 3, "", true);
            setobj["players." + key + ".playerInfo.cards"] = card;
            setobj["players." + key + ".lastBet"] = roomInfo.tinfo.tblbet_value;
          });

          commonClass.SendData(
            { data: { card: [] }, en: "DC", sc: 1 },
            roomInfo._id
          );

          setobj["utime"] = new Date(Date.now());

          timerClass.firstTurnTimer(roomId, socket, function (timerinfo) {});

          db.collection("tbl_room").updateOne(
            { _id: roomInfo._id },
            { $set: setobj },
            function (err, res) {
              return true;
            }
          );
        }
      }
    });
  },
  firstTurn: function (roomId, socket) {
    tablesManager.GetTableInfo(roomId, function (err, roomInfo) {
      if (roomInfo) {
        var ActivePlayers = playingCases.getActivePlayersCount(
          roomInfo.players
        );
        if (ActivePlayers > 1) {
          var turn = playingCases.getActionTurnPlayer(roomInfo.players);
          if (turn) {
            playingCases.nextTurn(roomInfo, turn, socket);
          } else {
            var deal = playingCases.getDealerPlayer(roomInfo.players);
            if (deal) {
              var turn = playingCases.getNextActivePlayer(
                roomInfo,
                deal.uid,
                "104"
              );
              var setobj = {};

              setobj["players." + turn.uid + ".turn"] = true;
              db.collection("tbl_room").updateOne(
                { _id: roomInfo._id },
                { $set: setobj },
                function (err, res) {
                  playingCases.nextTurn(roomInfo, turn, socket);
                }
              );
            } else {
              try {
                var deal = playingCases.decideDeal(roomInfo);
                if (
                  deal &&
                  deal != undefined &&
                  deal.uid &&
                  deal.uid != undefined
                ) {
                  var turn = playingCases.getNextActivePlayer(
                    roomInfo,
                    deal.uid,
                    "105"
                  );
                  setobj["players." + deal.uid + ".deal"] = true;
                  setobj["players." + turn.uid + ".turn"] = true;
                  setobj["igs"] = true;

                  db.collection("tbl_room").updateOne(
                    { _id: roomInfo._id },
                    { $set: setobj, $inc: inc },
                    function (err, res) {
                      playingCases.nextTurn(roomInfo, turn, socket);
                    }
                  );
                }
              } catch (e) {}
            }
          }
        }
      }
    });
  },
  decideDeal: function (RoomInfo) {
    if (RoomInfo && RoomInfo.players) {
      var players = RoomInfo.players;
      var firstPlayer = null,
        dealFound = false,
        isFirst = true,
        dealPlayer;
      for (var player in players) {
        if (players[player].active) {
          if (isFirst) {
            firstPlayer = players[player];
            isFirst = false;
          }
          if (players[player].deal === true) {
            dealPlayer = players[player];
            dealFound = true;
          }
        }
      }
      if (!dealFound) {
        return firstPlayer;
      } else {
        var nextPlayer = playingCases.getNextActivePlayer(
          RoomInfo,
          dealPlayer.uid,
          "106"
        );
        return nextPlayer;
      }
    }
  },
  decideTurn: function (RoomInfo) {
    var players = RoomInfo.players;
    var firstPlayer = null,
      dealFound = false,
      isFirst = true,
      dealPlayer;

    for (var player in players) {
      if (players[player].active) {
        if (isFirst) {
          firstPlayer = players[player];
          isFirst = false;
        }

        if (players[player].deal === true) {
          dealPlayer = players[player];
          dealFound = true;
        }
      }
    }

    if (!dealFound) {
      return firstPlayer;
    } else {
      var nextPlayer = playingCases.getNextActivePlayer(
        RoomInfo,
        dealPlayer.uid,
        "107"
      );
      return nextPlayer;
    }
  },
  getPrevActivePlayer: function (roomInfo, id) {
    var slot = roomInfo.players[id].slot,
      num = slot.substr(4) * 1;

    for (var count = 0; count <= 4; count++) {
      num--;
      num = Math.abs(num);

      if (num > 4) {
        num = num % 5;
      }
      if (roomInfo.availableSlot["slot" + num]) {
        continue;
      }
      if (playingCases.getPlayerBySlot("slot" + num)) {
        if (
          !playingCases.getPlayerBySlot("slot" + num).active ||
          playingCases.getPlayerBySlot("slot" + num).packed
        ) {
          continue;
        } else {
          break;
        }
      }
    }

    var newPlayer = playingCases.getPlayerBySlot(
      roomInfo.players,
      "slot" + num
    );
    return newPlayer;
  },
  getNextActivePlayer: function (roomInfo, id, type = "") {
    if (roomInfo.players[id].slot) {
      var slot = roomInfo.players[id].slot,
        num = slot.substr(4) * 1;

      for (var count = 0; count <= 4; count++) {
        num++;
        if (num > 4) {
          num = num % 5;
        }
        if (roomInfo.availableSlot["slot" + num]) {
          continue;
        }
        if (playingCases.getPlayerBySlot(roomInfo.players, "slot" + num)) {
          if (
            !playingCases.getPlayerBySlot(roomInfo.players, "slot" + num)
              .active ||
            playingCases.getPlayerBySlot(roomInfo.players, "slot" + num).packed
          ) {
            continue;
          } else {
            break;
          }
        }
      }

      var newPlayer = playingCases.getPlayerBySlot(
        roomInfo.players,
        "slot" + num
      );
      return newPlayer;
    }
  },
  getPlayerBySlot: function (players, slot) {
    for (var player in players) {
      if (players[player].slot === slot) {
        return players[player];
      }
    }
    return undefined;
  },
  getActivePlayers: function (players) {
    for (var player in players) {
      if (players[player].active === true && !players[player].packed) {
        return players[player];
      }
    }
    return undefined;
  },
  getActivePlayersCount: function (players) {
    var count = 0;
    for (var player in players) {
      if (players[player].active && !players[player].packed) {
        count++;
      }
    }
    return count;
  },
  getRobotActivePlayersCount: function (players) {
    var count = 0;
    for (var player in players) {
      if (
        players[player].is_robot &&
        players[player].active &&
        !players[player].packed
      ) {
        count++;
      }
    }
    return count;
  },
  getPlayersCount: function (players) {
    // return _.size(players);
    var count = 0;
    for (var player in players) {
      if (players[player].uid) {
        count++;
      }
    }
    return count;
  },
  getActionTurnPlayer: function (players) {
    var activePlayer;
    for (var player in players) {
      if (players[player].turn && players[player].active) {
        activePlayer = players[player];
        break;
      }
    }
    return activePlayer;
  },
  getRobotCount: function (players) {
    var count = 0;

    for (var player in players) {
      if (players[player].is_robot) {
        count++;
      }
    }
    return count;
  },
  getDealerPlayer: function (players) {
    var activePlayer;
    for (var player in players) {
      if (players[player].deal) {
        activePlayer = players[player];
        break;
      }
    }
    return activePlayer;
  },
  resetAllPlayers: function (players) {
    for (var player in players) {
      if (players[player].uid) {
        delete players[player].winner;
        delete players[player].playerInfo.cards;
        players[player].turn = false;
        players[player].active = true;
        players[player].packed = false;
        players[player].tblind = 0;
        players[player].tchaal = 0;
        players[player].isSideShowAvailable = false;
        players[player].lastBet = 0;
        players[player].lastAction = "";
        players[player].lc_use = 0;
      } else {
        delete players[player];
      }
    }
    return players;
  },
  removeUser: function (RoomInfo, user_id, rtype, socket) {
    if (RoomInfo.players[user_id]) {
      userSettingCases.clearUserRoomData(user_id, function (err, upudata) {
        var total_player = playingCases.getPlayersCount(RoomInfo.players);
        var userSlot = RoomInfo.players[user_id].slot;
        var isCurrentUserTurn = RoomInfo.players[user_id].turn;

        var bchips = RoomInfo.players[user_id].bchips;
        var achips = RoomInfo.players[user_id].achips;

        if (rtype == "SWITCH") {
          try {
            var csoket = RoomInfo.players[user_id].playerInfo.clientId;
            var socketss = io.sockets.connected[csoket];
            socketss.leave(RoomInfo._id);
          } catch (e) {
            // printLog(e)
          }

          commonClass.SendData(
            { data: { slot: userSlot, type: rtype }, en: "RL", sc: 1 },
            RoomInfo._id
          );
          tablesManager.switchTable(
            RoomInfo._id,
            RoomInfo.mode,
            RoomInfo.is_private,
            user_id,
            RoomInfo.tinfo,
            socket
          );
        } else {
          if (RoomInfo.itrmnt == true) {
            commonClass.SendData(
              { data: { slot: userSlot, type: rtype }, en: "RL", sc: 1 },
              RoomInfo._id
            );
          } else {
            commonClass.SendData(
              {
                data: { slot: userSlot, type: rtype, chips: achips - bchips },
                en: "RL",
                sc: 1,
              },
              RoomInfo._id
            );
          }
          try {
            var csoket = RoomInfo.players[user_id].playerInfo.clientId;
            if (csoket) {
              var socketss = io.sockets.connected[csoket];
              socketss.leave(RoomInfo._id);
            }
          } catch (e) {
            // printLog(e)
          }
        }

        if (total_player > 1) {
          var clients = playingCases.RoomConnectedSocket(RoomInfo._id, socket);

          var totalGamePlayer =
            playingCases.getPlayersCount(RoomInfo.players) - 1;
          var totalGameRobot = playingCases.getRobotCount(RoomInfo.players);

          // printLog('totalGamePlayer>>>>'+totalGamePlayer);
          // printLog('totalGameRobot>>>>'+totalGameRobot);
          if (totalGameRobot == totalGamePlayer && clients == undefined) {
            db.collection("tbl_room").deleteOne({ _id: RoomInfo._id });
          } else {
            if (isCurrentUserTurn) {
              var nextTurn = playingCases.getNextActivePlayer(
                RoomInfo,
                user_id,
                "108"
              );
            }

            var Players = RoomInfo.players;

            RoomInfo.availableSlot[userSlot] = userSlot;

            delete Players[user_id];
            var setobj = {},
              inc = {};
            inc["tp"] = -1;

            setobj["availableSlot"] = RoomInfo.availableSlot;

            var ActivePlayers = playingCases.getActivePlayersCount(Players);
            // printLog('ru123569');

            if (ActivePlayers == 1 && RoomInfo.igs == true) {
              timerClass.cancelTimerV2(
                RoomInfo._id,
                RoomInfo.timerid,
                function (cancleData) {
                  setobj["igs"] = false;
                  setobj["lastBet"] = 0;
                  setobj["amount"] = 0;
                  setobj["lastBlind"] = true;
                  setobj["players"] = Players;
                  setobj["timerType"] = "win";

                  var winuser = playingCases.getActivePlayers(Players);
                  if (winuser != undefined) {
                    Players[winuser.uid].playerInfo.chips =
                      winuser.playerInfo.chips + RoomInfo.amount;
                    Players[winuser.uid].achips =
                      winuser.achips + RoomInfo.amount;
                    Players[winuser.uid].tgw = winuser.tgw + 1;
                    Players[winuser.uid].turn = false;
                  }
                  playingCases.removeUserupdate(
                    RoomInfo,
                    setobj,
                    inc,
                    winuser,
                    isCurrentUserTurn,
                    nextTurn,
                    socket
                  );
                }
              );
            } else {
              var ActivePlayers = playingCases.getActivePlayersCount(Players);
              setobj["players"] = Players;

              if (ActivePlayers == 1) {
                timerClass.cancelTimerV2(
                  RoomInfo._id,
                  RoomInfo.timerid,
                  function (cancleData) {
                    playingCases.removeUserupdate(
                      RoomInfo,
                      setobj,
                      inc,
                      undefined,
                      isCurrentUserTurn,
                      nextTurn,
                      socket
                    );
                  }
                );
              } else {
                try {
                  if (isCurrentUserTurn && ActivePlayers > 1) {
                    Players[nextTurn.uid].turn = true;
                  }
                } catch (e) {}

                playingCases.removeUserupdate(
                  RoomInfo,
                  setobj,
                  inc,
                  undefined,
                  isCurrentUserTurn,
                  nextTurn,
                  socket
                );
              }
            }
          }

          // }catch(e){
          // 	printLog(e)
          // }
        } else {
          db.collection("tbl_room").deleteOne({ _id: RoomInfo._id });
        }
      });
    } else {
      try {
        var socketss = io.sockets.connected[socket.id];
        socketss.leave(RoomInfo._id);
      } catch (e) {
        printLog(e);
      }

      userSettingCases.clearUserRoomData(user_id, function (err, upudata) {
        var totalRoomUser = playingCases.RoomConnectedSocket(
          RoomInfo._id,
          socket
        );

        var totalGamePlayer = playingCases.getPlayersCount(RoomInfo.players);
        var totalGameRobot = playingCases.getRobotCount(RoomInfo.players);

        if (totalGameRobot == totalGamePlayer && totalRoomUser == undefined) {
          db.collection("tbl_room").deleteOne({ _id: RoomInfo._id });
        }

        if (rtype == "SWITCH") {
          tablesManager.switchTable(
            RoomInfo._id,
            RoomInfo.mode,
            RoomInfo.is_private,
            user_id,
            RoomInfo.tinfo,
            socket
          );
        } else {
          commonClass.SendData({ en: "RL", sc: 1 }, socket.id);
        }
      });
    }
  },
  removeUserupdate: function (
    RoomInfo,
    setobj,
    inc,
    winuser,
    isCurrentUserTurn,
    nextTurn,
    socket
  ) {
    var tblAmount = RoomInfo.amount;

    tablesManager.RoomFindUpdate(
      RoomInfo._id,
      { $set: setobj, $inc: inc },
      function (err, RoomInfo) {
        if (err) {
          printLog("err27");
          printLog(err);
        }
        if (RoomInfo) {
          var clients = playingCases.RoomConnectedSocket(RoomInfo._id, socket);

          var RoomInfo = RoomInfo.value;
          var totalGamePlayer = playingCases.getPlayersCount(RoomInfo.players);
          var totalGameRobot = playingCases.getRobotCount(RoomInfo.players);

          if (totalGameRobot == totalGamePlayer && clients == "undefined") {
            db.collection("tbl_room").deleteOne({ _id: RoomInfo._id });
          } else {
            var total_player = playingCases.getActivePlayersCount(
              RoomInfo.players
            );

            if (total_player == 1) {
              if (winuser != undefined) {
                winAmount = RoomInfo.players[winuser.uid].playerInfo.chips;
                commonClass.SendData(
                  {
                    data: {
                      slot: winuser.slot,
                      chips: winAmount,
                      wid: winuser.uid,
                    },
                    en: "WIN",
                    sc: 1,
                  },
                  RoomInfo._id
                );

                /*##################update user chips, cwchips and game play(gp)########################################*/
                chipsTrackerCases.insert(
                  {
                    chips: tblAmount,
                    type: "credit",
                    msg: "win",
                    ct: "chips",
                    uid: winuser.uid,
                  },
                  ""
                );
                if (RoomInfo.itrmnt == false) {
                  db.collection("game_users").updateOne(
                    { _id: winuser.uid },
                    {
                      $inc: {
                        chips: tblAmount,
                        cwchips: tblAmount,
                        "result.gw": 1,
                      },
                    },
                    function (err, resultjnk) {
                      if (err) {
                        printLog("err28");
                        printLog(err);
                      }
                    }
                  );
                }
                /*#######################################################################################################*/
              }

              var ActivePlayers = playingCases.getPlayersCount(
                RoomInfo.players
              );
              if (ActivePlayers > 1) {
                timerClass.cancelTimerV2(
                  RoomInfo._id,
                  RoomInfo.timerid,
                  function (cancleData) {
                    timerClass.WinnerTimer(
                      RoomInfo._id,
                      socket,
                      function (wtdata) {}
                    );
                  }
                );
              } else {
                var upWhere = { $set: {} };
                upWhere.$set.timerType = "";
                tablesManager.RoomUpdate(RoomInfo._id, upWhere);
              }
            } else {
              if (isCurrentUserTurn) {
                playingCases.nextTurn(RoomInfo, nextTurn, socket);
              }
            }
          }
        }
      }
    );
  },
  userPack: function (RoomInfo, user_id, ptype, socket) {
    if (RoomInfo.players[user_id]) {
      var userSlot = RoomInfo.players[user_id].slot;
      var userTT = RoomInfo.players[user_id].tt;

      RoomInfo.players[user_id].active = false;
      var ActivePlayers = playingCases.getActivePlayersCount(RoomInfo.players);

      if (ActivePlayers == 1) {
        var setobj = {},
          inc = {},
          unset = {},
          winAmount = 0;
        setobj["igs"] = false;
        setobj["lastBet"] = 0;
        setobj["amount"] = 0;
        setobj["lastBlind"] = true;

        setobj["players." + user_id + ".turn"] = false;
        unset["players." + user_id + ".playerInfo.cards"] = 1;

        if (ptype == "timeout") {
          setobj["players." + user_id + ".tt"] = userTT + 1;
        }

        var winuser = playingCases.getActivePlayers(RoomInfo.players);

        winAmount = RoomInfo.amount;
        inc["players." + winuser.uid + ".playerInfo.chips"] = winAmount;
        inc["players." + winuser.uid + ".achips"] = winAmount;
        inc["players." + winuser.uid + ".tgw"] = 1;
        setobj["players." + winuser.uid + ".turn"] = false;
        unset["players." + winuser.uid + ".playerInfo.cards"] = 1;

        tablesManager.RoomFindUpdate(
          RoomInfo._id,
          { $set: setobj, $inc: inc, $unset: unset },
          function (err, RoomInfos) {
            if (err) {
              printLog("err29");
              printLog(err);
            }
            if (RoomInfos.value) {
              var RoomInfo = RoomInfos.value;

              // printLog('userPack PACK');

              commonClass.SendData(
                {
                  data: {
                    slot: userSlot,
                  },
                  en: "PACK",
                  sc: 1,
                },
                RoomInfo._id
              ); //Next Turn

              if (winuser != undefined) {
                uwinAmount = RoomInfo.players[winuser.uid].playerInfo.chips;
                commonClass.SendData(
                  {
                    data: {
                      slot: winuser.slot,
                      chips: uwinAmount,
                      wid: winuser.uid,
                    },
                    en: "WIN",
                    sc: 1,
                  },
                  RoomInfo._id
                );

                /*##################update user chips, cwchips and game play(gp)########################################*/
                chipsTrackerCases.insert(
                  {
                    chips: winAmount,
                    type: "credit",
                    msg: "win",
                    ct: "chips",
                    uid: winuser.uid,
                  },
                  ""
                );
                if (RoomInfo.itrmnt == false) {
                  db.collection("game_users").updateOne(
                    { _id: winuser.uid },
                    {
                      $inc: {
                        chips: winAmount,
                        cwchips: winAmount,
                        "result.gw": 1,
                      },
                    },
                    function (err) {
                      if (err) {
                        printLog("err30");
                        printLog(err);
                      }
                    }
                  );
                }
                /*#######################################################################################################*/
              }

              var total_player = playingCases.getPlayersCount(RoomInfo.players);
              if (total_player > 1 && RoomInfo.igs == false) {
                timerClass.WinnerTimer(
                  RoomInfo._id,
                  socket,
                  function (wtdata) {}
                );
              }
            }
          }
        );
      } else {
        // printLog('userPack PACK2');

        var nextTurn = playingCases.getNextActivePlayer(
          RoomInfo,
          user_id,
          "109"
        );
        if (nextTurn) {
          var setobj = {},
            unset = {};
          setobj["players." + nextTurn.uid + ".turn"] = true;
          setobj["players." + user_id + ".packed"] = true;
          setobj["players." + user_id + ".turn"] = false;
          unset["players." + user_id + ".playerInfo.cards"] = 1;

          if (ptype == "timeout") {
            setobj["players." + user_id + ".tt"] = userTT + 1;
          }

          tablesManager.RoomUpdate(
            RoomInfo._id,
            { $set: setobj, $unset: unset },
            function (err, updateRoomData) {
              commonClass.SendData(
                {
                  data: {
                    slot: userSlot,
                  },
                  en: "PACK",
                  sc: 1,
                },
                RoomInfo._id
              ); //Next Turn

              playingCases.nextTurn(RoomInfo, nextTurn, socket);
            }
          );
        }
      }
    }
  },
  turnTimeOut: function (roomId, currentTurnId, socket) {
    tablesManager.GetTableInfo(roomId, function (err, RoomInfo) {
      if (RoomInfo) {
        var ActivePlayers = playingCases.getActivePlayersCount(
          RoomInfo.players
        );

        if (ActivePlayers > 1 && RoomInfo.igs == true) {
          if (RoomInfo.players[currentTurnId]) {
            var totalTimeout = RoomInfo.players[currentTurnId].tt;
            var timeout = RoomInfo.players[currentTurnId].timeout;
            if (timeout == false) {
              var nextTurn = playingCases.getNextActivePlayer(
                RoomInfo,
                currentTurnId,
                "110"
              );
              var setobj = {};
              setobj["players." + nextTurn.uid + ".turn"] = true;
              setobj["players." + currentTurnId + ".turn"] = false;
              setobj["players." + currentTurnId + ".timeout"] = true;
              setobj["cstatus"] = "";
              tablesManager.RoomUpdate(
                RoomInfo._id,
                { $set: setobj },
                function (err, updateRoomData) {
                  if (RoomInfo.cstatus == "SS") {
                    playingCases.nextTurn(RoomInfo, nextTurn, socket);
                  } else {
                    playingCases.userPack(
                      RoomInfo,
                      currentTurnId,
                      "timeout",
                      socket
                    );
                  }
                }
              );
            } else if (
              totalTimeout >= 2 &&
              RoomInfo.players[currentTurnId].is_robot == false
            ) {
              playingCases.removeUser(
                RoomInfo,
                currentTurnId,
                "standup",
                socket
              );
            } else {
              playingCases.userPack(RoomInfo, currentTurnId, "timeout", socket);
            }
          } else {
            timerClass.WinnerTimer(RoomInfo._id, socket, function (wtdata) {});

            // commonClass.SendData({'en':'RL', 'sc':1}, socket.id);
          }
        } else {
          // printLog('1jnk12345');
        }
      } else {
        // printLog('1jnk123454567');
      }
    });
  },
  decideWinner: function (players, variation) {
    var cardSets = [],
      cards = [],
      winnerCard,
      msg = "";
    for (var player in players) {
      players[player].turn = false;
      if (
        players[player].active &&
        !players[player].packed &&
        players[player].playerInfo.cards
      ) {
        switch (parseInt(variation)) {
          case 1:
            var handNormal = teenPattiScore.scoreHandsNormal(
              players[player].playerInfo.cards
            );
            break;
          case 2:
            var handNormal = teenPattiScore.scoreHandsAK47(
              players[player].playerInfo.cards
            );
            break;
          case 3:
            var handNormal = teenPattiScore.scoreHandsLowestJoker(
              players[player].playerInfo.cards
            );
            break;
          case 4:
            var handNormal = teenPattiScore.scoreHandsLowest(
              players[player].playerInfo.cards
            );
            break;
          case 6:
            var handNormal = teenPattiScore.scoreHands1942(
              players[player].playerInfo.cards
            );
            break;
          case 7:
            var handNormal = teenPattiScore.scoreHandsblackjack(
              players[player].playerInfo.cards
            );
            break;
          case 8:
            var handNormal = teenPattiScore.scoreHands999(
              players[player].playerInfo.cards
            );
            break;
          default:
            var handNormal = teenPattiScore.scoreHandsNormal(
              players[player].playerInfo.cards
            );
        }

        cardSets.push({
          id: players[player].uid,
          slot: players[player].slot,
          hand: handNormal,
        });

        cards.push({
          slot: players[player].slot,
          card: players[player].playerInfo.cards,
          hand: handNormal.desc,
        });
      }
    }

    // printLog(cardSets);

    winnerCard = _.maxBy(cardSets, function (n) {
      return n.hand.score;
    });

    if (winnerCard) {
      return { winner: winnerCard, card: cards };
    }
    return undefined;
  },
  tournamentWinner: function (players) {
    var cardSets = [],
      cards = [],
      winnerCard,
      msg = "";

    for (var player in players) {
      cardSets.push({
        id: players[player].uid,
        slot: players[player].slot,
        hand: 0,
      });
    }

    // printLog(cardSets);

    winnerCard = _.maxBy(cardSets, function (n) {
      return n.hand;
    });

    if (winnerCard) {
      return { winner: winnerCard };
    }
    return undefined;
  },
  decideWinnerSideShow: function (players, user_id, other_id, variation) {
    var playersInfo = {};
    playersInfo[user_id] = players[user_id];
    playersInfo[other_id] = players[other_id];

    return playingCases.decideWinner(playersInfo, variation);
  },
  setKing: function (players, roomId, is_return) {
    var playersArray = [];

    for (var player in players) {
      playersArray.push({
        slot: players[player].slot,
        _id: players[player].uid,
        chips: players[player].achips - players[player].bchips,
      });
    }

    var king = _.maxBy(playersArray, function (o) {
      return o.chips;
    });

    if (is_return == true) {
      return king;
    } else {
      if (king && king.chips > 0) {
        commonClass.SendData(
          {
            data: {
              slot: king.slot,
            },
            en: "KING",
            sc: 1,
          },
          roomId
        );
      } else {
        commonClass.SendData(
          {
            en: "KING",
            sc: 2,
          },
          roomId
        );
      }
    }
  },
  nextTurn: function (roomInfo, turn, socket) {
    var ActivePlayers = playingCases.getActivePlayersCount(roomInfo.players);
    if (ActivePlayers > 1 && roomInfo.igs == true) {
      if (turn && turn.is_robot) {
        // printLog('Robot Turn');
        commonClass.SendData(
          {
            data: {
              slot: turn.slot,
              time: config.GAME_TURN_TIMER,
              lastBet: roomInfo.lastBet,
              lastBlind: roomInfo.lastBlind,
              amount: roomInfo.amount,
            },
            en: "NT",
            sc: 1,
          },
          roomInfo._id
        ); //Next Turn

        autoCases.robotTurn(roomInfo, turn, socket);
      } else {
        timerClass.NextTurnTimerV2(
          roomInfo._id,
          turn.uid,
          socket,
          function (data12) {
            commonClass.SendData(
              {
                data: {
                  slot: turn.slot,
                  time: config.GAME_TURN_TIMER,
                  lastBet: roomInfo.lastBet,
                  lastBlind: roomInfo.lastBlind,
                  amount: roomInfo.amount,
                },
                en: "NT",
                sc: 1,
              },
              roomInfo._id
            ); //Next Turn
          }
        );
      }
    }
  },
  WinnerTimerAfter: function (roomId, socket) {
    tablesManager.GetTableInfo(roomId, function (err, roomInfo) {
      if (roomInfo) {
        var players = playingCases.resetAllPlayers(roomInfo.players);
        var ActivePlayers = playingCases.getPlayersCount(players);

        if (
          ActivePlayers > 1 &&
          roomInfo.igs == false &&
          roomInfo.timerType != "gameStart"
        ) {
          if (roomInfo.itrmnt) {
            playingCases.isTournamnetFinish(roomInfo, socket);
          } else {
            playingCases.setKing(roomInfo.players, roomInfo._id, false);
            timerClass.gameStartTimer(roomInfo._id, socket);
          }
        }
      }
    });
  },
  RoomConnectedSocket: function (roomId, socket) {
    // printLog(roomId);
    try {
      var clients = io.of("/").adapter.rooms[roomId];

      // var clients = socket.adapter.rooms[roomId];
      // printLog('clients');
      // printLog(clients);
    } catch (e) {
      printLog("errr");
      printLog(e);
      var clients = undefined;
    }

    return clients;
  },
  isTournamnetFinish: function (RoomInfo, socket) {
    var players = RoomInfo.players;
    // var unset = {},inc = {};

    _.forOwn(players, function (value, key) {
      if (players[key].playerInfo.chips < RoomInfo.tinfo.tblbet_value) {
        // commonClass.SendData({data:{slot:players[key].slot},'en':'SU', 'sc':1}, RoomInfo._id);
        // userSettingCases.clearUserRoomData( key );
        // unset['players.'+key] = '';
        delete players[key];
      }
    });

    var ActivePlayers = playingCases.getPlayersCount(RoomInfo.players);
    if (ActivePlayers == 1) {
      var winnerInfo = playingCases.tournamentWinner(players);
      // printLog('winnerInfo');
      // printLog(winnerInfo);
      // printLog(players);
      if (winnerInfo != undefined) {
        /*##################update user chips, cwchips########################################*/
        var WinAmount = RoomInfo.tnmntInfo.winAmount;
        chipsTrackerCases.insert(
          {
            chips: WinAmount,
            type: "credit",
            msg: "TOurnamnet Win",
            ct: "chips",
            uid: winnerInfo.winner.id,
          },
          ""
        );
        var upWhere = { $inc: { chips: WinAmount } };
        userSettingCases.userFindUpdate(
          upWhere,
          winnerInfo.winner.id,
          function (err, res) {
            if (err) {
              printLog("err31");
              printLog(err);
            }
            if (res) {
              commonClass.SendData(
                {
                  data: {
                    slot: winnerInfo.winner.slot,
                    wchips: WinAmount,
                    wid: winnerInfo.winner.id,
                  },
                  en: "TWIN",
                  sc: 1,
                },
                RoomInfo._id
              );

              try {
                if (RoomInfo.players[winnerInfo.winner.id].is_robot == false) {
                  commonClass.SendData(
                    { chips: res.value.chips, en: "UC", sc: 1 },
                    RoomInfo.players[winnerInfo.winner.id].clientId
                  );
                }
              } catch (e) {}

              setTimeout(function () {
                commonClass.SendData({ en: "RL", sc: 1 }, RoomInfo._id);
                db.collection("tbl_room").deleteOne({ _id: RoomInfo._id });
              }, 6000);
            }
          }
        );
        /*#######################################################################################################*/
      }
    } else if (ActivePlayers > 1) {
      playingCases.setKing(RoomInfo.players, RoomInfo._id, false);
      timerClass.gameStartTimer(RoomInfo._id, socket);
    }
  },
  ResponseSU: function (userSlot, chips, roomId) {
    commonClass.SendData(
      {
        data: {
          slot: userSlot,
          chips: chips,
        },
        en: "SU",
        sc: 1,
      },
      roomId
    ); //Next Turn
  },
  ResponseNT: function (RoomInfo, user_id, nextTurn, betamount) {
    commonClass.SendData(
      {
        data: {
          slot: nextTurn.slot,
          time: config.GAME_TURN_TIMER,
          lastBet: RoomInfo.lastBet,
          lastBlind: RoomInfo.lastBlind,
          pslot: RoomInfo.players[user_id].slot,
          puc: RoomInfo.players[user_id].playerInfo.chips, //user chips
          pbetamount: betamount,
          amount: RoomInfo.amount,
        },
        en: "NT",
        sc: 1,
      },
      RoomInfo._id
    ); //Next Turn
  },
  TEST: function (data, socket) {
    var data = data.data;
    var roomId = objectId(data.roomId);
    tablesManager.GetTableInfo(roomId, function (err, RoomInfo) {
      if (RoomInfo) {
        // var deal = playingCases.decideDeal(RoomInfo);
        // var turn = playingCases.decideTurn(RoomInfo);
        // printLog(turn.slot);
        // printLog(deal.slot);
        // var ActivePlayers = playingCases.getActivePlayersCount(RoomInfo.players);
        // printLog(ActivePlayers);
        // var TotalUser = playingCases.getPlayersCount(RoomInfo.players);
        // printLog(TotalUser);
        // var PrevActivePlayer = playingCases.getPrevActivePlayer(RoomInfo, objectId('5ba8ce5389cf151d20f75887'));
        // printLog(PrevActivePlayer);
      }
    });
  },
  addUserPlayMatch: function (players, roomId) {
    _.each(players, function (player) {
      if (player.is_robot == false && player.active == true) {
        db.collection("game_user_play_match").insertOne(
          {
            uid: player.uid.toString(),
            roomId: roomId.toString(),
            date: new Date(),
          },
          function (err) {
            printLog(err);
          }
        );
      }
    });
  },
};
