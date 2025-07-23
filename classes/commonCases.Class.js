var randomstring = require("randomstring");
var cryptoLib = require("cryptlib");

var key = config.ENCRYPT_KEY;
var iv = config.ENCRYPT_IV;
shaKey = cryptoLib.getHashSha256(key, 32);

module.exports = {
  encryptedString: function (string) {
    return string;
  },
  decryptedString: function (string) {
    return string;
  },
  //   encryptedString: function (string) {
  //     return cryptoLib.encrypt(string, shaKey, iv);
  //   },
  //   decryptedString: function (string) {
  //     return cryptoLib.decrypt(string, shaKey, iv);
  //   },
  GetRandomString: function (len) {
    return randomstring.generate(len);
  },
  SendData: function (data, socket) {
    printLog("\n\n\nsend data");
    printLog(data);
    printLog("\n\n\n");

    io.to(socket).emit("res", data);
    // io.to(socket).emit(
    //   "res",
    //   commonClass.encryptedString(JSON.stringify(data))
    // );
  },
  SendDataBroadCast: function (data) {
    printLog("\n\n\nsend data");
    printLog(data);
    printLog("\n\n\n");
    io.sockets.emit("res", commonClass.encryptedString(JSON.stringify(data)));
  },
  getRandomInt: function (max) {
    return Math.floor(Math.random() * Math.floor(max));
  },
  room_user_left: function (room_id, socket, reason = "") {
    socket.leave(room_id);

    if (reason == "") {
      commonClass.SendData({ en: "RL", sc: 1 }, socket.id);
    } else {
      commonClass.SendData({ en: "RL", sc: 1, reason: reason }, socket.id);
    }
  },
};
