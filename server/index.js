const bodyParser = require("body-parser");
const cors = require("cors");
var http = require("http");
var express = require("express");
var app = express();
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const server = http.createServer(app);
const { Server } = require("socket.io");
//const { createBrotliCompress } = require("zlib");
//const { connected } = require("process");
//const { SocketAddress } = require("net");
const { time } = require("console");
const io = new Server(server, { cors: { origin: "*" } });

const db = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "password",
  database: "chat",
  port: 3306,
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

server.listen(3001);
console.log("server running on port 3001");

let userslist = [];

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

app.post("/SignIn", (req, res) => {
  for (let i = 0; i < userslist; i++) {
    if (req.body.username == userslist[i][0]) {
      userslist.splice(i, 1);
      console.log("splice cause repeat: " + userslist);
    }
  }

  db.query(
    "SELECT * FROM users WHERE name = ?",
    [req.body.username],
    (err, result) => {
      if (result.length > 0) {
        bcrypt
          .compare(req.body.password, result[0].password)
          .then(function (result) {
            if (result) {
              //generate key and send it to client
              let i = Math.floor(Math.random() * 999999999);
              userslist.push([req.body.username, i]);
              res.send("" + i);
            }
          });
      }
    }
  );
});

app.post("/SignUp", (req, res) => {
  console.log("signup!");
  db.query(
    "SELECT * FROM users WHERE name = ?",
    [req.body.username],
    (err, result) => {
      if (result) {
        //name is taken
      } else {
        bcrypt.genSalt(10, function (err, salt) {
          bcrypt.hash(req.body.password, salt, function (err, hash) {
            db.query("INSERT INTO users (name, password) VALUES(?, ?);", [
              req.body.username,
              hash,
            ]);
          });
          res.send("success");
        });
      }
    }
  );
});

async function GetIdBySocketId(socketid) {
  return new Promise((res, rej) => {
    io.in(socketid)
      .fetchSockets()
      .then((sockets) => {
        console.log("sockets");
        console.log(sockets);
        res(sockets[0].UID);
      });
  });
}

app.post("/GetMessages", (req, res) => {
  GetIdBySocketId(req.body.Uid).then((SocketID) => {
    db.query(
      "SELECT authorid, message, time FROM messages WHERE authorid = ? AND recipientid = ? UNION SELECT authorid, message, time FROM messages WHERE authorid = ? AND recipientid = ? ORDER BY time; ",
      [SocketID, req.body.Fid, req.body.Fid, SocketID],
      (err, result) => {
        let newresult = [];
        let author = "";
        let author1 = "";
        let author2 = "";
        db.query(
          "SELECT * FROM users WHERE id = ? OR id = ?",
          [SocketID, req.body.Fid],
          (error, res2) => {
            for (let i = 0; i < res2.length; i++) {
              if (res2[i].id == SocketID) {
                author1 = res2[i].name;
              } else {
                author2 = res2[i].name;
              }
            }

            for (let i = 0; i < result.length; i++) {
              if (result[i].authorid == SocketID) {
                author = author1;
              } else {
                author = author2;
              }
              let timestr = "" + result[i].time;
              timestr = timestr.slice(0, 24);
              newresult.push([author, result[i].message, timestr]);
            }
            res.send([newresult]);
            console.log("Sent archived messages");
          }
        );
      }
    );
  });
});

io.on("connection", (socket) => {
  console.log("a user connected");
  console.log(socket.id);
  socket.on("verify", (verify) => {
    for (let i = 0; i < userslist.length; i++) {
      if (userslist[i][1] == verify) {
        console.log(socket.id + " is verified as " + userslist[i][0]);
        db.query(
          "SELECT * FROM users WHERE name = ?",
          [userslist[i][0]],
          (err, result) => {
            socket.UID = result[0].id;
            userslist.splice(i, 1);
            socket.emit("verified");
          }
        );
      }
    }
  });

  socket.on("SelectRoom", (room) => {
    GetIdBySocketId(socket.id).then((SocketID) => {
      if (room < SocketID) {
        socket.join(room + ":" + SocketID);
      } else {
        socket.join(SocketID + ":" + room);
      }
    });
  });

  socket.on("SendMessage", (message) => {
    lastmessage = message;

    GetIdBySocketId(socket.id).then((SocketID) => {
      db.query("SELECT * FROM users WHERE id = ?", SocketID, (err, result) => {
        if (result == undefined) {
          return;
        }
        if (message[0] < SocketID) {
          io.to(message[0] + ":" + SocketID).emit("recieveMessage", [
            result[0].name,
            message[1],
            message[2],
          ]);
        } else {
          io.to(SocketID + ":" + message[0]).emit("recieveMessage", [
            result[0].name,
            message[1],
            message[2],
          ]);
        }

        db.query(
          "INSERT INTO messages (authorid, recipientid, message, time) VALUES (?,?,?,?)",
          [SocketID, message[0], message[1], message[2]]
        );
      });
    });
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("addFriend", (friendName) => {
    db.query(
      "SELECT * FROM users WHERE id = ? OR name = ?",
      [socket.data.UID, friendName],
      (err, result) => {
        console.log(
          result[0].name + " and " + result[1].name + " are now friends!"
        );
        db.query("INSERT INTO friends (id, fid) VALUES(?, ?);", [
          result[0].id,
          result[1].id,
        ]);
      }
    );
  });

  GetNameById = (id) => {
    db.query("SELECT * FROM users WHERE id = ?", "" + id, (err, result) => {
      return result[0].name;
    });
  };
  GetIdByName = (name) => {
    db.query("SELECT * FROM users WHERE name = ?", [name], (err, result) => {
      return "" + result[0].id;
    });
  };

  app.post("/getName", (req, res) => {
    db.query(
      "SELECT name FROM users WHERE id = ?",
      "" + req.body.id,
      (err, result) => {
        res.send(result);
      }
    );
  });

  socket.on("getFriendsList", () => {
    GetIdBySocketId(socket.id).then((user) => {
      console.log(user);
      db.query(
        "SELECT id FROM friends WHERE fid = ? UNION SELECT fid FROM friends WHERE id = ? ;",
        [user, user],
        (err, result) => {
          db.query(
            "CREATE TABLE temp AS SELECT id FROM friends WHERE fid = ? UNION SELECT fid FROM friends WHERE id = ?;",
            [user, user],
            (err, result) => {
              db.query(
                "SELECT users.name, users.id FROM users JOIN temp ON temp.id=users.id;",
                (err, result) => {
                  db.query("DROP TABLE temp");
                  socket.emit("FriendsList", result);
                }
              );
            }
            //
          );
        }
      );
    });
  });
  socket.on("keycodepressed", (code) => {
    console.log("keycode: " + code + " has been pressed");
  });
});
