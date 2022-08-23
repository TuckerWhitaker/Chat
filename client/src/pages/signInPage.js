import React, { useState, useEffect } from "react";
import "./signInPage.css";
import Axios from "axios";

function SignInPage() {
  const [userName, SetuserName] = useState("");
  const [password, Setpassword] = useState("");

  const signIn = () => {
    Axios.post("http://localhost:3001/SignIn", {
      username: userName,
      password: password,
    }).then((response) => {
      if (response.data !== null) {
        document.cookie = "uid=" + response.data;
        console.log(document.cookie);
        window.location.replace("http://localhost:3000/main");
      }
    });
  };

  return (
    <div className="parent">
      <div className="spacer" />
      <h1 id="title">Sign In</h1>
      <input
        className="txtin"
        type="text"
        placeholder="Username"
        onChange={(e) => SetuserName(e.target.value)}
      ></input>
      <input
        className="txtin"
        type="text"
        placeholder="Password"
        onChange={(e) => Setpassword(e.target.value)}
      ></input>
      <button
        className="btn"
        onClick={() => {
          signIn();
        }}
      >
        Sign In
      </button>
    </div>
  );
}

export default SignInPage;
