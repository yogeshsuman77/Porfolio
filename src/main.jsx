import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import './index.css'

/* Global styles – order matters */
import "./styles/variables.css";
import "./styles/typography.css";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);