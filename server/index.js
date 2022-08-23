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
      console.log(result);
      console.log(err);
      if (result.length > 0) {
        bcrypt
          .compare(req.body.password, result[0].password)
          .then(function (result) {
            if (result) {
              //generate key and send it to client
              let i = Math.floor(Math.random() * 999999999);
              userslist.push([req.body.username, i]);
              res.send("" + i);
              console.log(userslist);
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
    console.log("verify:" + verify + ":");

    console.log(userslist.length);
    for (let i = 0; i < userslist.length; i++) {
      console.log(":" + userslist[i][1] + ":");
      if (userslist[i][1] == verify) {
        console.log(socket.id + " is " + userslist[i][0]);
        connectedUsers.push([userslist[i][0], socket.id]);
      }
    }
  });

  socket.on("message", (message) => {
    console.log(message);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    for (let i = 0; i < connectedUsers.length; i++) {
      if (socket.id == connectedUsers[i][0]) connectedUsers.pop(i);
      console.log("removed " + socket.id + " From connectedUsers");
    }
  });
});
