const bodyParser = require("body-parser");
const cors = require("cors");
var http = require("http");
var express = require("express");
var app = express();
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const server = http.createServer(app);
const { Server } = require("socket.io");
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

server.listen(80);
console.log("server running on port 80");

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("message", (message) => {
    console.log(message);
  });
});
