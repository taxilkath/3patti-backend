const express = require("express");
const app = express();
const port = 9000;
var MongoClient = require("mongodb").MongoClient;
const MONGODB_URI = "mongodb://localhost:27017/";
app.get("/delete", (req, res) => {
  let ress = {};
  MongoClient.connect(MONGODB_URI, function (err, db) {
    if (err) throw err;
    var dbo = db.db("TeenPattiEncrypt");
    //Find the first document in the customers collection:
    dbo
      .collection("game_users")
      .deleteMany({ is_robot: false }, function (err, result) {
        if (err) throw err;
        console.log("user" + result);
        ress["user"] = result;
        db.close();
      });
  });
  MongoClient.connect(MONGODB_URI, function (err, db) {
    if (err) throw err;
    var dbo = db.db("TeenPattiEncrypt");
    //Find the first document in the customers collection:
    dbo.collection("tbl_room").deleteMany({}, function (err, result) {
      if (err) throw err;
      console.log("table" + result);
      ress["table"] = result;
      db.close();
    });
  });
  res.send("user and table deleted");
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
