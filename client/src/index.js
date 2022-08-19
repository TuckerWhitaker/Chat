import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import SignIn from "./pages/signInPage";
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <SignIn />
  </React.StrictMode>
);
