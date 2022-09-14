import React, { useState, useEffect } from "react";
import "./signInPage.css";
import Axios from "axios";

function SignUpPage() {
  const [userName, SetuserName] = useState("");
  const [password, Setpassword] = useState("");

  const signUp = () => {
    Axios.post("https://whitakert.com/Chat/API/SignUp", {
      username: userName,
      password: password,
    }).then((response) => {
      if (response.data === "success") {
        alert("success");
      }
    });
  };

  return (
    <div className="parent">
      <div className="spacer" />
      <h1 id="title">Sign Up</h1>
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
          signUp();
        }}
      >
        Sign Up
      </button>
    </div>
  );
}

export default SignUpPage;
