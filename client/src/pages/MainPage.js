import { Axios } from "axios";
import React, { useState } from "react";
import "./MainPage.css";
const { io } = require("socket.io-client");
var socket = io.connect("ws://localhost:3001");

function MainPage() {
  //

  const [friendName, SetfriendName] = useState("");

  const addFriend = () => {
    console.log(friendName);
    socket.emit("addFriend", friendName);
    console.log("friend?");
  };

  const startConnection = () => {
    for (let i = 0; i < document.cookie.length; i++) {
      if (document.cookie.substring(i, i + 4) === "uid=") {
        socket.emit(
          "verify",
          document.cookie.substring(i + 4, document.cookie.length)
        );
      }
    }
  };

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
          <textarea id="txt"></textarea>
          <button id="btn" onClick={startConnection()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default MainPage;
