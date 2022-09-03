import { Axios } from "axios";
import React, { useState, useEffect } from "react";
import "./MainPage.css";
const { io } = require("socket.io-client");
var socket = io.connect("ws://localhost:3001");

function MainPage() {
  //

  const [selectedFriendID, SetFriendID] = useState();
  const [friendName, SetfriendName] = useState("");
  const [message, SetMessage] = useState("");

  const addFriend = () => {
    console.log(friendName);
    socket.emit("addFriend", friendName);
  };

  const getFriendsList = () => {
    socket.emit("getFriendsList");
    console.log("getfriends");
  };

  socket.on("FriendsList", (result) => {
    console.log(result.length);
    let j = document.getElementById("FriendsList").children.length;
    for (let i = 0; i < j; i++) {
      document.getElementById("FriendsList").children[0].remove();
    }

    for (let i = 0; i < result.length; i++) {
      console.log(result[i].name + " " + result[i].id + "index: " + i);
      const f = document.createElement("button");
      f.innerHTML = result[i].name;
      f.className = "FriendItem";
      f.id = result[i].id;
      f.onclick = () => {
        selectFriend(f.id);
      };
      document.getElementById("FriendsList").appendChild(f);
    }
  });

  const selectFriend = (id) => {
    //get old messages from mysql
    SetFriendID(id);
  };

  const sendMessage = () => {
    var today = new Date();
    var dateTime =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate() +
      " " +
      today.getHours() +
      ":" +
      today.getMinutes() +
      ":" +
      today.getSeconds();
    socket.emit("SendMessage", [selectedFriendID, message, dateTime]);
  };

  socket.on("recieveMessage", (message) => {
    let m = document.createElement("div");
    m.innerHTML = message[1] + "   " + message[0] + "   " + message[2];
    m.className = "msg";
    document.getElementById("chatContainer").appendChild(m);
  });

  const StartConnection = () => {
    useEffect(() => {
      for (let i = 0; i < document.cookie.length; i++) {
        if (document.cookie.substring(i, i + 4) === "uid=") {
          console.log(document.cookie.substring(i + 4, document.cookie.length));
          socket.emit(
            "verify",
            document.cookie.substring(i + 4, document.cookie.length)
          );
        }
      }
    }, []);
  };

  document.onreadystatechange = StartConnection();

  return (
    <div className="Parent">
      <div className="container" id="Friends">
        <div>
          <input
            type="text"
            placeholder="Friend's name"
            id="frtxt"
            onChange={(e) => {
              SetfriendName(e.target.value);
            }}
          ></input>
          <button
            id="frbtn"
            onClick={() => {
              addFriend();
            }}
          >
            Add Friend
          </button>
          <div id="FriendsList"></div>
        </div>
      </div>
      <div className="container" id="Chat">
        <div id="chatHeader">
          <h1>Group/Username</h1>
          <h3>Members</h3>
        </div>
        <div id="chatContainer">
          <div>chat!</div>
        </div>

        <div id="inputContainer">
          <textarea
            id="txt"
            onChange={(e) => {
              SetMessage(e.target.value);
            }}
          ></textarea>
          <button
            id="btn"
            onClick={() => {
              sendMessage();
            }}
          >
            Send
          </button>
          <button
            onClick={() => {
              getFriendsList();
            }}
          >
            refresh friends
          </button>
        </div>
      </div>
    </div>
  );
}

export default MainPage;
