module.exports = {
  getDefaultFields: function (data, socket, callback) {
    var ud = {
      amount: 0,
      lastBet: 0,
      lastBlind: true,
      tp: 0, //total player
      players: {},
      timerid: "", //timer id
      timerType: "", //timer type
      utime: new Date(Date.now()), //update time,
      igs: false,
      itrmnt: false,
      variation: 1,
      cstatus: "", //current playing status like turn, show, side show
      dealer: "http://appinstallshop.com/game/dealer/dealer_1.png",
      dname: "Tanya",
      availableSlot: {
        slot0: "slot0",
        slot1: "slot1",
        slot2: "slot2",
        slot3: "slot3",
        slot4: "slot4",
      },
    };
    callback(ud);
  },
  JT: function (data, socket) {
    var en = data.en;
    if (typeof data.data == "undefined") {
      commonClass.SendData(
        { Message: "JT request is not in data object", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }
    var data = data.data;
    data["en"] = en;

    if (typeof data.user_id == "undefined") {
      commonClass.SendData(
        { Message: "JT user_id is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }
    if (typeof data.tt == "undefined") {
      //table type : DJ = direct join
      commonClass.SendData(
        { Message: "JT tt is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }
    if (typeof data.mode == "undefined") {
      //1 = normal, 2 = variation
      commonClass.SendData(
        { Message: "JT mode is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }
    if (typeof data.is_private == "undefined") {
      //0 = false, 1 = true
      commonClass.SendData(
        { Message: "JT is_private is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    try {
      var user_id = objectId(data.user_id);
    } catch (e) {
      commonClass.SendData(
        { Message: "invalid Request", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    switch (data.tt) {
      case "DJ":
        tablesManager.DJ(data, socket, function (err, res) {});
        break;
      case "PJ":
        tablesManager.PJ(data, socket, function (err, res) {});
        break;
      case "TM":
        tablesManager.TM(data, socket, function (err, res) {});
        break;
    }
  },
  GTL: function (data, socket) {
    var en = data.en;
    if (typeof data.data == "undefined") {
      commonClass.SendData(
        {
          Message: "Guestsignup request is not in data object",
          en: data.en,
          sc: 0,
        },
        socket.id
      );
      return false;
    }
    var data = data.data;
    data["en"] = en;

    db.collection("game_tables")
      .find({})
      .toArray(function (err, gameTableInfo) {
        commonClass.SendData(
          { data: gameTableInfo, en: data.en, sc: 1 },
          socket.id
        );
      });
  },
  DJ: function (data, socket) {
    db.collection("game_users").findOne(
      { _id: objectId(data.user_id) },
      function (err, res) {
        printLog(err);
        // printLog(res);
        if (res) {
          var uchips = res.chips;

          if (uchips < 2) {
            commonClass.SendData(
              {
                Message: "you don't have enough chips to play on this table.",
                en: data.en,
                sc: 501,
              },
              socket.id
            );
            return false;
          } else {
            var suchips = uchips / 500;

            if (parseInt(suchips) < 2) {
              var suchips = uchips;
            }

            // printLog('suchips>>>>'+suchips);
            db.collection("game_tables")
              // find({ tblbet_value : { $lte: 100 }}).
              .find({ tblbet_value: { $lte: suchips } })
              .limit(1)
              .sort({ tblbet_value: -1 })
              .toArray(function (e, sdata) {
                if (sdata.length > 0) {
                  var gtres = sdata[0];
                  var tbl_chips = gtres.tblbet_value;

                  if (res.roomSeat != "" && res.roomId != "") {
                    // printLog('res.roomSeat>>>'+res.roomSeat);
                    // printLog('res.roomId>>>'+res.roomId);
                    tablesManager.GetTableInfo(
                      objectId(res.roomId),
                      function (err, rres) {
                        if (rres) {
                          // if(rres.players[data.user_id].uid == res._id.toString()){

                          // 		printLog('2');
                          // 	commonClass.SendData({'Message' :"you are already playing in other table",'roomId':res.roomId, 'en':data.en,'sc':2}, socket.id);
                          // 	return false;

                          // }else{

                          tablesManager.join_table(
                            data,
                            res,
                            gtres,
                            socket,
                            function (userData) {}
                          );
                          // }
                        } else {
                          if (uchips < tbl_chips) {
                            commonClass.SendData(
                              {
                                Message:
                                  "you don't have enough chips to play on this table.",
                                en: data.en,
                                sc: 501,
                              },
                              socket.id
                            );
                            return false;
                          } else {
                            tablesManager.join_table(
                              data,
                              res,
                              gtres,
                              socket,
                              function (userData) {}
                            );
                          }
                        }
                      }
                    );
                  } else {
                    if (uchips < tbl_chips) {
                      commonClass.SendData(
                        {
                          Message:
                            "you don't have enough chips to play on this table.",
                          en: data.en,
                          sc: 501,
                        },
                        socket.id
                      );
                      return false;
                    } else {
                      tablesManager.join_table(
                        data,
                        res,
                        gtres,
                        socket,
                        function (userData) {}
                      );
                    }
                  }
                } else {
                  commonClass.SendData(
                    {
                      Message:
                        "you don't have enough chips to play on this table.",
                      en: data.en,
                      sc: 501,
                    },
                    socket.id
                  );
                  return false;
                }
              });
          }
        } else {
          commonClass.SendData(
            { Message: "user not found", en: data.en, sc: 501 },
            socket.id
          );
          return false;
        }
      }
    );
  },
  PJ: function (data, socket) {
    if (typeof data.tblvalue == "undefined") {
      commonClass.SendData(
        { Message: "PJ tblvalue is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    var tblvalue = data.tblvalue;

    db.collection("game_users").findOne(
      { _id: objectId(data.user_id) },
      function (err, res) {
        if (res) {
          var uchips = res.chips;

          if (uchips < tblvalue) {
            commonClass.SendData(
              {
                Message: "you don't have enough chips to create private table",
                en: data.en,
                sc: 501,
              },
              socket.id
            );
            return false;
          } else {
            tablesManager.privateTblCreate(
              data,
              socket,
              res,
              function (response) {}
            );
          }
        }
      }
    );
  },
  TM: function (data, socket) {
    db.collection("game_users").findOne(
      { _id: objectId(data.user_id) },
      function (err, res) {
        if (res) {
          var uchips = res.chips;

          if (uchips < 100) {
            // printLog('1');
            commonClass.SendData(
              {
                Message: "you don't have enough chips to play on this table.",
                en: data.en,
                sc: 501,
              },
              socket.id
            );
            return false;
          } else {
            var suchips = uchips / 10;

            if (uchips < 300) {
              var suchips = uchips;
            }

            db.collection("game_tables")
              .find({ tblbet_value: { $lte: 100 } })
              // find({ tblbet_value : { $lte: suchips }}).
              .limit(1)
              .sort({ tblbet_value: -1 })
              .toArray(function (e, sdata) {
                // printLog(sdata);
                if (sdata.length > 0) {
                  var gtres = sdata[0];
                  var tbl_chips = gtres.tblbet_value;

                  if (res.roomSeat != "" && res.roomId != "") {
                    // printLog('res.roomSeat>>>'+res.roomSeat);
                    // printLog('res.roomId>>>'+res.roomId);
                    tablesManager.GetTableInfo(
                      objectId(res.roomId),
                      function (err, rres) {
                        if (rres) {
                          tablesManager.join_table(
                            data,
                            res,
                            gtres,
                            socket,
                            function (userData) {}
                          );
                        } else {
                          if (uchips < tbl_chips) {
                            // printLog('3');
                            commonClass.SendData(
                              {
                                Message:
                                  "you don't have enough chips to play on this table.",
                                en: data.en,
                                sc: 501,
                              },
                              socket.id
                            );
                            return false;
                          } else {
                            tablesManager.join_table(
                              data,
                              res,
                              gtres,
                              socket,
                              function (userData) {}
                            );
                          }
                        }
                      }
                    );
                  } else {
                    if (uchips < tbl_chips) {
                      // printLog('4');
                      commonClass.SendData(
                        {
                          Message:
                            "you don't have enough chips to play on this table.",
                          en: data.en,
                          sc: 501,
                        },
                        socket.id
                      );
                      return false;
                    } else {
                      tablesManager.join_table(
                        data,
                        res,
                        gtres,
                        socket,
                        function (userData) {}
                      );
                    }
                  }
                } else {
                  // printLog('table not found');
                  commonClass.SendData(
                    {
                      Message:
                        "you don't have enough chips to play on this table.",
                      en: data.en,
                      sc: 501,
                    },
                    socket.id
                  );
                  return false;
                }
              });
          }
        } else {
          commonClass.SendData(
            { Message: "user not found", en: data.en, sc: 501 },
            socket.id
          );
          return false;
        }
      }
    );
  },
  JFT: function (data, socket) {
    var en = data.en;
    if (typeof data.data == "undefined") {
      commonClass.SendData(
        { Message: "JFT request is not in data object", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }
    var data = data.data;
    data["en"] = en;

    if (typeof data.user_id == "undefined") {
      commonClass.SendData(
        { Message: "JFT user_id is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }
    if (typeof data.roomId == "undefined") {
      commonClass.SendData(
        { Message: "JFT roomId is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    var roomId = objectId(data.roomId);
    db.collection("game_users").findOne(
      { _id: objectId(data.user_id) },
      function (err, res) {
        if (res) {
          var uchips = res.chips;

          tablesManager.GetTableInfo(objectId(roomId), function (err, rres) {
            if (rres) {
              if (
                uchips >= rres.tinfo.tblbet_value &&
                rres.tp < config.PER_TABLE_PLAYER
              ) {
                tablesManager.roomUserAdd(res, rres, socket);
              } else {
                commonClass.SendData(
                  {
                    Message: "no empty seat available on this table.",
                    en: "JT",
                    sc: 2,
                  },
                  socket.id
                );
              }
            } else {
              commonClass.SendData(
                {
                  Message: "no empty seat available on this table.",
                  en: "JT",
                  sc: 2,
                },
                socket.id
              );
            }
          });
        } else {
          commonClass.SendData(
            { Message: "user not found", en: data.en, sc: 501 },
            socket.id
          );
          return false;
        }
      }
    );
  },
  switchTable: function (roomId, mode, is_private, user_id, tblInfo, socket) {
    var data = {
      mode: mode,
      is_private: is_private,
    };

    db.collection("game_users").findOne({ _id: user_id }, function (err, res) {
      if (res) {
        tablesManager.join_table_2(roomId, data, res, tblInfo, socket);
      }
    });
  },
  join_table: function (data, userData, tblData, socket, callback) {
    db.collection("tbl_room").findOne(
      {
        mode: data.mode,
        is_private: 0,
        "tinfo._id": tblData._id,
        tp: { $lt: config.PER_TABLE_PLAYER },
      },
      function (err, rres) {
        if (rres) {
          if (userData.roomId.toString() == rres._id.toString()) {
            socket.join(rres._id);
            commonClass.SendData({ data: rres, en: "JT", sc: 1 }, socket.id);
          } else {
            if (userData.chips >= rres.tinfo.tblbet_value) {
              tablesManager.roomUserAdd(userData, rres, socket);
            } else {
              commonClass.SendData(
                {
                  Message: "you don't have enough chips to play on this table.",
                  en: data.en,
                  sc: 501,
                },
                socket.id
              );
              return false;
            }
          }
        } else {
          tablesManager.getDefaultFields(data, socket, function (tData) {
            var playerSlot = "";
            for (var slot in tData.availableSlot) {
              playerSlot = slot;
              break;
            }

            delete tData.availableSlot[playerSlot];

            var user_id = userData._id;
            var uinfo = {
              uid: userData._id,
              playerInfo: {
                un: userData.un,
                chips: userData.chips,
                pp: userData.pp,
                clientId: socket.id, //socket id
              },
              tt: 0, //total timeout
              slot: playerSlot,
              active: true,
              packed: false,
              isSideShowAvailable: false, //is sideshow available
              lastBet: 0,
              turn: false,
              lastAction: "",
              deal: false,
              timeout: false,
              tblind: 0,
              tchaal: 0,
              tgp: 0, //total game play
              tgw: 0, //total game won
              bchips: userData.chips, //before chips
              achips: userData.chips, //after chips
              is_robot: userData.is_robot,
              gift: "",
              lc_use: 0,
            };

            tData.tinfo = tblData;
            tData.players = { [user_id]: uinfo };
            tData.tp = tData.tp + 1;
            tData.mode = data.mode;

            if (data.mode == 2) {
              tData.variations = config.GAME_VARIATIONS;
            }

            tData.is_private = data.is_private;
            db.collection("tbl_room").insertOne(
              tData,
              function (err, roomInfo) {
                var roomId = roomInfo.ops[0]._id;
                var upWhere = {
                  $set: { socketId: socket.id, roomId: roomId, status: 1 },
                };

                userSettingCases.updateUserData(
                  upWhere,
                  user_id,
                  function (err, res) {
                    socket.join(roomInfo.ops[0]._id);
                    commonClass.SendData(
                      { data: roomInfo.ops[0], en: "JT", sc: 1 },
                      socket.id
                    );

                    if (roomInfo.ops[0].is_private == 0) {
                      timerClass.otherUserWaitngTimer(
                        roomInfo.ops[0]._id,
                        socket
                      );
                    }
                  }
                );
              }
            );
          });
        }
      }
    );
  },
  join_table_2: function (roomId, data, userData, tblData, socket, callback) {
    db.collection("tbl_room").findOne(
      {
        _id: { $ne: roomId },
        mode: data.mode,
        is_private: 0,
        "tinfo._id": tblData._id,
        tp: { $lt: config.PER_TABLE_PLAYER },
      },
      function (err, rres) {
        if (rres) {
          if (userData.roomId.toString() == rres._id.toString()) {
            socket.join(rres._id);
            commonClass.SendData({ data: rres, en: "JT", sc: 1 }, socket.id);
          } else {
            if (userData.chips >= rres.tinfo.tblbet_value) {
              tablesManager.roomUserAdd(userData, rres, socket);
            } else {
              commonClass.SendData(
                {
                  Message: "you don't have enough chips to play on this table.",
                  en: data.en,
                  sc: 501,
                },
                socket.id
              );
              return false;
            }
          }
        } else {
          if (userData.chips >= tblData.tblbet_value) {
            tablesManager.getDefaultFields(data, socket, function (tData) {
              var playerSlot = "";
              for (var slot in tData.availableSlot) {
                playerSlot = slot;
                break;
              }

              delete tData.availableSlot[playerSlot];

              var user_id = userData._id;
              var uinfo = {
                uid: userData._id,
                playerInfo: {
                  un: userData.un,
                  chips: userData.chips,
                  pp: userData.pp,
                  clientId: socket.id, //socket id
                },
                tt: 0, //total timeout
                slot: playerSlot,
                active: true,
                packed: false,
                isSideShowAvailable: false, //is sideshow available
                lastBet: 0,
                turn: false,
                lastAction: "",
                deal: false,
                timeout: true,
                tblind: 0,
                tchaal: 0,
                tgp: 0, //total game play
                tgw: 0, //total game won
                bchips: userData.chips, //before chips
                achips: userData.chips, //after chips
                is_robot: userData.is_robot,
                gift: "",
                lc_use: 0,
              };

              tData.tinfo = tblData;
              tData.players = { [user_id]: uinfo };
              tData.tp = tData.tp + 1;
              tData.mode = data.mode;

              if (data.mode == 2) {
                tData.variations = config.GAME_VARIATIONS;
              }

              tData.is_private = data.is_private;
              db.collection("tbl_room").insertOne(
                tData,
                function (err, roomInfo) {
                  var roomId = roomInfo.ops[0]._id;
                  var upWhere = {
                    $set: { socketId: socket.id, roomId: roomId, status: 1 },
                  };

                  userSettingCases.updateUserData(
                    upWhere,
                    user_id,
                    function (err, res) {
                      socket.join(roomInfo.ops[0]._id);
                      commonClass.SendData(
                        { data: roomInfo.ops[0], en: "JT", sc: 1 },
                        socket.id
                      );

                      if (roomInfo.ops[0].is_private == 0) {
                        timerClass.otherUserWaitngTimer(
                          roomInfo.ops[0]._id,
                          socket
                        );
                      }
                    }
                  );
                }
              );
            });
          } else {
            commonClass.SendData(
              {
                Message: "you don't have enough chips to play on this table.",
                en: data.en,
                sc: 501,
              },
              socket.id
            );
            return false;
          }
        }
      }
    );
  },
  join_table_3: function (
    data,
    userData,
    tblData,
    tnmntInfo,
    socket,
    callback
  ) {
    db.collection("tbl_room").findOne(
      {
        itrmnt: true,
        itrmnt_start: false,
        mode: data.mode,
        is_private: 0,
        "tinfo._id": tblData._id,
        tp: { $lt: config.PER_TABLE_PLAYER },
      },
      function (err, rres) {
        if (rres) {
          if (userData.roomId.toString() == rres._id.toString()) {
            socket.join(rres._id);
            commonClass.SendData({ data: rres, en: "JT", sc: 1 }, socket.id);
          } else {
            tablesManager.roomUserAdd(userData, rres, socket);
          }
        } else {
          tablesManager.getDefaultFields(data, socket, function (tData) {
            var playerSlot = "";
            for (var slot in tData.availableSlot) {
              playerSlot = slot;
              break;
            }

            delete tData.availableSlot[playerSlot];

            var user_id = userData._id;
            var uinfo = {
              uid: userData._id,
              playerInfo: {
                un: userData.un,
                chips: tnmntInfo.playingChips,
                pp: userData.pp,
                clientId: socket.id, //socket id
              },
              tt: 0, //total timeout
              slot: playerSlot,
              active: true,
              packed: false,
              isSideShowAvailable: false, //is sideshow available
              lastBet: 0,
              turn: false,
              lastAction: "",
              deal: false,
              timeout: true,
              tblind: 0,
              tchaal: 0,
              tgp: 0, //total game play
              tgw: 0, //total game won
              bchips: tnmntInfo.playingChips, //before chips
              achips: tnmntInfo.playingChips, //after chips
              is_robot: userData.is_robot,
              gift: "",
              lc_use: 0,
            };

            tData.tinfo = tblData;
            tData.tnmntInfo = tnmntInfo;
            tData.players = { [user_id]: uinfo };
            tData.tp = tData.tp + 1;
            tData.mode = data.mode;
            tData.itrmnt = true;
            tData.itrmnt_start = false;

            if (data.mode == 2) {
              tData.variations = config.GAME_VARIATIONS;
            }

            tData.is_private = 0;
            db.collection("tbl_room").insertOne(
              tData,
              function (err, roomInfo) {
                var roomId = roomInfo.ops[0]._id;
                var upWhere = {
                  $set: { socketId: socket.id, roomId: roomId, status: 1 },
                  $inc: {
                    chips: -(tnmntInfo.buyIn + tnmntInfo.entryFee),
                    cwchips: -(tnmntInfo.buyIn + tnmntInfo.entryFee),
                  },
                };

                userSettingCases.updateUserData(
                  upWhere,
                  user_id,
                  function (err, res) {
                    if (err) {
                      printLog(err);
                    }

                    chipsTrackerCases.insert(
                      {
                        chips: -(tnmntInfo.buyIn + tnmntInfo.entryFee),
                        type: "debit",
                        msg: "tournament join",
                        ct: "chips",
                        uid: user_id,
                      },
                      ""
                    );
                    socket.join(roomInfo.ops[0]._id);
                    commonClass.SendData(
                      { data: roomInfo.ops[0], en: "JT", sc: 1 },
                      socket.id
                    );

                    if (roomInfo.ops[0].is_private == 0) {
                      timerClass.otherUserWaitngTimer(
                        roomInfo.ops[0]._id,
                        socket
                      );
                    }
                  }
                );
              }
            );
          });
        }
      }
    );
  },
  roomUserAdd: function (userInfo, roomInfo, socket) {
    var upWhere = { $inc: { tp: 1 } };
    tablesManager.RoomUpdate(roomInfo._id, upWhere, function (err, res) {
      for (var slot in roomInfo.availableSlot) {
        var playerSlot = slot;
        break;
      }

      if (roomInfo.itrmnt) {
        userInfo.chips = roomInfo.tnmntInfo.playingChips;
      }

      if (playerSlot != undefined) {
        delete roomInfo.availableSlot[playerSlot];
        var user_id = userInfo._id;
        var uinfo = {
          uid: userInfo._id,
          playerInfo: {
            un: userInfo.un,
            chips: userInfo.chips,
            pp: userInfo.pp,
          },
          tt: 0, //total timeout
          slot: playerSlot,
          active: true,
          packed: false,
          isSideShowAvailable: false, //is sideshow available
          lastBet: 0,
          turn: false,
          lastAction: "",
          deal: false,
          timeout: false,
          tblind: 0,
          tchaal: 0,
          tgp: 0, //total game play
          tgw: 0, //total game won
          bchips: userInfo.chips, //before chips
          achips: userInfo.chips, //after chips
          is_robot: userInfo.is_robot,
          gift: "",
          lc_use: 0,
        };

        if (roomInfo.igs) {
          uinfo.active = false;
        }

        if (userInfo.is_robot == false) {
          uinfo.playerInfo.clientId = socket.id; //socket id
        }

        let setobj = {};
        var players = roomInfo.players;
        players[user_id] = uinfo;
        setobj["players"] = players;
        setobj["availableSlot"] = roomInfo.availableSlot;

        var nuuinfo = uinfo;
        nuuinfo["utime"] = new Date(Date.now());

        commonClass.SendData({ data: nuuinfo, en: "NU", sc: 1 }, roomInfo._id);

        if (userInfo.is_robot == false) {
          socket.join(roomInfo._id);
        }

        delete uinfo.utime;

        tablesManager.RoomFindUpdate(
          roomInfo._id,
          { $set: setobj },
          function (err, updateRoomData) {
            if (roomInfo.itrmnt) {
              var upWhere = {
                $set: { socketId: socket.id, roomId: roomInfo._id, status: 1 },
                $inc: {
                  chips: -(
                    roomInfo.tnmntInfo.buyIn + roomInfo.tnmntInfo.entryFee
                  ),
                  cwchips: -(
                    roomInfo.tnmntInfo.buyIn + roomInfo.tnmntInfo.entryFee
                  ),
                },
              };

              chipsTrackerCases.insert(
                {
                  chips: -(
                    roomInfo.tnmntInfo.buyIn + roomInfo.tnmntInfo.entryFee
                  ),
                  type: "debit",
                  msg: "tournament join",
                  ct: "chips",
                  uid: user_id,
                },
                ""
              );
            } else {
              var upWhere = {
                $set: { socketId: socket.id, roomId: roomInfo._id, status: 1 },
              };
            }
            userSettingCases.updateUserData(
              upWhere,
              user_id,
              function (err1, res) {
                if (err1) {
                  printLog(err1);
                }
              }
            );

            var total_player = playingCases.getPlayersCount(roomInfo.players);

            if (updateRoomData.value) {
              if (roomInfo.itrmnt) {
                if (
                  config.PER_TABLE_PLAYER ==
                  playingCases.getPlayersCount(updateRoomData.value.players)
                ) {
                  timerClass.gameStartTimer(updateRoomData.value._id, socket);
                } else {
                  timerClass.otherUserWaitngTimer(
                    updateRoomData.value._id,
                    socket
                  );
                }
              } else {
                // printLog(updateRoomData.value);
                if (total_player > 1 && updateRoomData.value.igs == true) {
                  var timediff = require("timediff");
                  var last_update = updateRoomData.value.utime;
                  var startTime = new Date(Date.now());
                  var diff = timediff(last_update, startTime, "s");
                  diff["totalMilli"] = config.GAME_TURN_TIMER;
                  if (config.GAME_TURN_TIMER < diff.milliseconds) {
                    diff["milliseconds"] = config.GAME_TURN_TIMER;
                  }
                }

                if (
                  total_player == 2 &&
                  updateRoomData.value.timerType != "win" &&
                  updateRoomData.value.timerType != "gameStart"
                ) {
                  if (userInfo.is_robot == false) {
                    commonClass.SendData(
                      {
                        data: updateRoomData.value,
                        time: diff,
                        en: "JT",
                        sc: 1,
                      },
                      socket.id
                    );
                  }
                  timerClass.gameStartTimer(updateRoomData.value._id, socket);
                } else {
                  var next_time = moment().format("YYYY-MM-DD HH:mm:ss");
                  var start_time = moment(roomInfo.utime).format(
                    "YYYY-MM-DD HH:mm:ss"
                  );
                  let diff_milliseconds =
                    Date.parse(next_time) - Date.parse(start_time);
                  let diff_seconds = diff_milliseconds / 1000;

                  if (diff_seconds > 30) {
                    if (userInfo.is_robot == false) {
                      for (var player in updateRoomData.value.players) {
                        updateRoomData.value.players[player].turn = false;
                      }

                      commonClass.SendData(
                        {
                          data: updateRoomData.value,
                          time: diff,
                          en: "JT",
                          sc: 1,
                        },
                        socket.id
                      );
                    }
                    timerClass.gameStartTimer(updateRoomData.value._id, socket);
                  } else if (diff_seconds < 5 && roomInfo.igs == false) {
                    if (userInfo.is_robot == false) {
                      commonClass.SendData(
                        {
                          data: updateRoomData.value,
                          time: diff,
                          en: "JT",
                          sc: 1,
                        },
                        socket.id
                      );
                    }
                    commonClass.SendData(
                      { data: { time: diff_seconds * 1000 }, en: "GST", sc: 1 },
                      socket.id
                    );
                  } else {
                    if (userInfo.is_robot == false) {
                      commonClass.SendData(
                        {
                          data: updateRoomData.value,
                          time: diff,
                          en: "JT",
                          sc: 1,
                        },
                        socket.id
                      );
                    }
                  }
                }

                if (
                  config.PER_TABLE_PLAYER >
                  playingCases.getPlayersCount(updateRoomData.value.players)
                ) {
                  if (updateRoomData.value.is_private == 0) {
                    timerClass.otherUserWaitngTimer(
                      updateRoomData.value._id,
                      socket
                    );
                  }
                }
              }
            }
          }
        );
      }
    });
  },
  addBot: function (roomId, socket, callback) {
    tablesManager.GetTableInfo(roomId, function (err, RoomInfo) {
      if (RoomInfo) {
        if (
          playingCases.getPlayersCount(RoomInfo.players) <
          config.PER_TABLE_PLAYER
        ) {
          tablesManager.GetBotInfo(0, function (err, binfo) {
            if (binfo) {
              var rn = require("random-number");
              var options = {
                min: 10,
                max: 20,
                integer: true,
              };

              var randID = rn(options);
              var randChips = RoomInfo.tinfo.tblchaal * randID;
              var upWhere = { $set: { chips: randChips } };
              userSettingCases.userFindUpdate(
                upWhere,
                binfo._id,
                function (err, userInfo) {
                  if (userInfo) {
                    tablesManager.roomUserAdd(userInfo.value, RoomInfo, socket);
                  } else {
                    printLog("bot not found2");
                  }
                }
              );
            } else {
              db.collection("game_users").updateMany(
                { is_robot: true },
                { $set: { status: 0 } }
              );
              timerClass.otherUserWaitngTimer(RoomInfo._id, socket);
              printLog("bot not found1");
            }
          });
        }
      }
    });
  },
  GetTableInfo: function (roomId, callback) {
    db.collection("tbl_room").findOne({ _id: roomId }, callback);
  },
  RoomUpdate: function (roomId, data, callback) {
    db.collection("tbl_room").updateOne({ _id: roomId }, data, callback);
  },
  RoomFindUpdate: function (roomId, data, callback) {
    db.collection("tbl_room").findOneAndUpdate(
      { _id: roomId },
      data,
      { returnOriginal: false },
      callback
    );
  },
  GetBotInfo: function (chips = 0, callback) {
    db.collection("game_users").findOne(
      { is_robot: true, status: 0, chips: { $gte: chips } },
      callback
    );
  },
  GameTableUpdate: function (tblId, data, callback) {
    db.collection("game_tables").updateOne({ _id: tblId }, data, callback);
  },
  privateTblCreate: function (data, socket, userData) {
    tablesManager.getDefaultFields(data, socket, function (tData) {
      var playerSlot = "";
      for (var slot in tData.availableSlot) {
        playerSlot = slot;
        break;
      }

      delete tData.availableSlot[playerSlot];

      var user_id = userData._id;
      var uinfo = {
        uid: userData._id,
        playerInfo: {
          un: userData.un,
          chips: userData.chips,
          pp: userData.pp,
          clientId: socket.id, //socket id
        },
        tt: 0, //total timeout
        slot: playerSlot,
        active: true,
        packed: false,
        isSideShowAvailable: false, //is sideshow available
        lastBet: 0,
        turn: false,
        lastAction: "",
        deal: false,
        timeout: true,
        tblind: 0,
        tgp: 0, //total game play
        tgw: 0, //total game won
        bchips: userData.chips, //before chips
        achips: userData.chips, //after chips
        is_robot: userData.is_robot,
        gift: "",
        lc_use: 0,
      };

      var chaallimit = data.tblvalue * 128;
      var pot_limit = chaallimit * 8;

      tData.tinfo = {
        _id: objectId("5ba9b37f4db9f9fa6e1e7770"),
        tblname: "Private",
        tblbet_value: data.tblvalue,
        tblblinds: 4,
        tblchaal: chaallimit,
        tblpot: pot_limit,
      };

      tData.players = { [user_id]: uinfo };
      tData.tp = tData.tp + 1;
      tData.mode = data.mode;

      if (data.mode == 2) {
        tData.variations = config.GAME_VARIATIONS;
      }

      tData.is_private = data.is_private;
      db.collection("tbl_room").insertOne(tData, function (err, roomInfo) {
        var roomId = roomInfo.ops[0]._id;
        var upWhere = {
          $set: { socketId: socket.id, roomId: roomId, status: 1 },
        };

        userSettingCases.updateUserData(upWhere, user_id, function (err, res) {
          socket.join(roomInfo.ops[0]._id);
          commonClass.SendData(
            { data: roomInfo.ops[0], tt: "PJ", en: "JT", sc: 1 },
            socket.id
          );
        });
      });
    });
  },
};
