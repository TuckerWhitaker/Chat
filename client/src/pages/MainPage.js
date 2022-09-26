import axios, { Axios } from "axios";
import React, { useState, useEffect } from "react";
import "./MainPage.css";
const { io } = require("socket.io-client");
var socket = io("wss://whitakert.com:443");

console.log(socket);
function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

const createMessage = (message) => {
  let m = document.createElement("div");
  let mChild = document.createElement("div");
  mChild.className = "Cinfo";
  m.appendChild(mChild);
  let mChild2 = document.createElement("div");
  mChild2.className = "Cmessage";
  m.appendChild(mChild2);

  let namediv = document.createElement("div");
  let datediv = document.createElement("div");
  namediv.className = "Cname";
  datediv.className = "Cdate";
  mChild.appendChild(namediv);
  mChild.appendChild(datediv);

  namediv.innerHTML = message[0];
  datediv.innerHTML = message[2];
  mChild2.innerHTML = message[1];
  m.className = "msg";
  document.getElementById("chatContainer").appendChild(m);
};

socket.on("recieveMessage", (message) => {
  createMessage(message);
});

document.addEventListener("keyup", function (event) {
  if (event.code === "Enter") {
    console.log("enter");
    //SendMessage();
  }
});

function MainPage() {
  //

  const [selectedFriendID, SetFriendID] = useState();
  const [friendName, SetfriendName] = useState("");
  const [message, SetMessage] = useState("");

  socket.on("connect", () => {
    startconnect();
  });

  const addFriend = () => {
    socket.emit("addFriend", friendName);
  };

  const getFriendsList = () => {
    socket.emit("getFriendsList");
  };

  socket.on("FriendsList", (result) => {
    let j = document.getElementById("FriendsList").children.length;
    for (let i = 0; i < j; i++) {
      document.getElementById("FriendsList").children[0].remove();
    }

    for (let i = 0; i < result.length; i++) {
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

    let parent = document.getElementById("chatContainer");
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }

    axios
      .post("https://whitakert.com/Chat/API/GetMessages", {
        Uid: socket.id,
        Fid: id,
      })
      .then((response) => {
        for (let i = 0; i < response.data[0].length; i++) {
          createMessage(response.data[0][i]);
        }
      });

    SetFriendID(id);
    axios
      .post("https://whitakert.com/Chat/API/getName", { id })
      .then((response) => {
        document.getElementById("GroupName").innerHTML = response.data[0].name;
      });
    socket.emit("SelectRoom", id);
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
    document.getElementById("txt").value = "";
  };

  async function SendMessage() {
    await delay(Math.random() * 1000);

    sendMessage();
  }

  MainPage.SendMessage = SendMessage;

  async function startconnect() {
    //wait random time then send verify, kinda dumb but it works, ill fix later
    await delay(Math.random() * 1000);
    for (let i = 0; i < document.cookie.length; i++) {
      if (document.cookie.substring(i, i + 4) === "uid=") {
        socket.emit(
          "verify",
          document.cookie.substring(i + 4, document.cookie.length)
        );
        getFriendsList();
      }
    }
  }

  return (
    <div className="MParent" id="Mparent">
      <div className="container" id="Friends">
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
      <div className="container" id="Chat">
        <div id="chatHeader">
          <h1 id="GroupName">Group/Username</h1>
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
        </div>
      </div>
    </div>
  );
}

document.addEventListener("keyup", function (event) {
  if (event.code === "Enter") {
    console.log("enter");
    MainPage.SendMessage();
  }
});

export default MainPage;
