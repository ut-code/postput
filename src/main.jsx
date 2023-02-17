import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// import './index.css'
import { SocketProvider } from "./socket";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SocketProvider>
      <App />
    </SocketProvider>
  </React.StrictMode>
);
