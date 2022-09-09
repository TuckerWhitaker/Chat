import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <App />
    <meta
      name="viewport"
      content="width=device-width, height=device-height, initial-scale=1"
    ></meta>
  </React.StrictMode>
);
