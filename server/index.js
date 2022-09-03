const bodyParser = require("body-parser");
const cors = require("cors");
var http = require("http");
var express = require("express");
var app = express();
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const server = http.createServer(app);
const { Server } = require("socket.io");
const { createBrotliCompress } = require("zlib");
const { connected } = require("process");
const { SocketAddress } = require("net");
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
let connectedUsers = [];

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

app.post("/SignIn", (req, res) => {
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
      if (result.length > 0) {
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

io.on("connection", (socket) => {
  console.log("a user connected");
  console.log(socket.id);

  socket.on("verify", (verify) => {
    for (let i = 0; i < connectedUsers.length; i++) {
      if (connectedUsers[i][0] == socket.id) {
        console.log("return");
        return;
      }
    }
    for (let i = 0; i < userslist.length; i++) {
      if (userslist[i][1] == verify) {
        console.log(socket.id + " is verified as " + userslist[i][0]);
        db.query(
          "SELECT * FROM users WHERE name = ?",
          [userslist[i][0]],
          (err, result) => {
            connectedUsers.push([result[0].id, socket.id]);
            userslist.pop(i);
          }
        );
      }
    }
  });

  /* const Ping = () => {
    for(let i = 0; i < connectedUsers; i++){
      if(connectedUsers[i][0])
    }
  }*/

  socket.on("SendMessage", (message) => {
    console.log(message[0] + "   " + connectedUsers);
    for (let i = 0; i < connectedUsers.length; i++) {
      console.log(connectedUsers[i][0]);
      if (message[0] == connectedUsers[i][0]) {
        io.to(connectedUsers[i][1]).emit("recieveMessage", [
          socket.id,
          message[1],
          message[2],
        ]);
        console.log("sent message");
        console.log(connectedUsers);
      }
    }
    db.query(
      "INSERT INTO messages (authorid, recipientid, message, time) VALUES (?,?,?,?)",
      [GetIdBySocketId(socket.id), message[0], message[1], message[2]]
    );
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    for (let i = 0; i < connectedUsers.length; i++) {
      if (socket.id == connectedUsers[i][0]) connectedUsers.pop(i);
      console.log("removed " + socket.id + " From connectedUsers");
    }
  });

  socket.on("addFriend", (friendName) => {
    for (let i = 0; i < connectedUsers.length; i++) {
      if (connectedUsers[1][i] == socket.id) {
        db.query(
          "SELECT * FROM users WHERE id = ? OR name = ?",
          [connectedUsers[i][0], friendName],
          (err, result) => {
            db.query("INSERT INTO friends (id, fid) VALUES(?, ?);", [
              result[0].id,
              result[1].id,
            ]);
          }
        );
      }
    }
  });

  GetNameById = (id) => {
    db.query("SELECT * FROM users WHERE id = ?", [id], (err, result) => {
      return result[0].name;
    });
  };
  GetIdByName = (name) => {
    db.query("SELECT * FROM users WHERE name = ?", [name], (err, result) => {
      return result[0].id;
    });
  };
  GetIdBySocketId = (socketid) => {
    for (let i = 0; i < connectedUsers.length; i++) {
      if (connectedUsers[i][1] == socketid) {
        return connectedUsers[i][0];
      }
    }
  };

  socket.on("getFriendsList", () => {
    let user = GetIdBySocketId(socket.id);
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
