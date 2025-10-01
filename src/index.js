// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import "./countdown.css"; // your shared styles :contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}
import { BrowserRouter } from "react-router-dom";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
