import React from "react";
import "./signInPage.css";
function signInPage() {
  return (
    <div className="parent">
      <div className="spacer" />
      <input className="txtin" type="text" placeholder="Username"></input>
      <input className="txtin" type="text" placeholder="Password"></input>
      <button className="btn">Sign In</button>
    </div>
  );
}

export default signInPage;
