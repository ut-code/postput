import React, { useState } from "react";
import  "./Login.css";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";

export default function Login(props) {
  const { onLogin, setSid } = props;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const tryLogin = async () => {
    try{
      const res = await (
        await fetch("http://localhost:3000/login/password", {
          method: "post",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ username: username, password: password }),
          credentials: "include",
        })
      ).json();
      if (res.status === "success") {
        setSid(res.sid);
        onLogin();
      }
    } catch{
      const res = await (
        await fetch("https://postput-test-server.onrender.com/login/password", {
          method: "post",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ username: username, password: password }),
          credentials: "include",
        })
      ).json();
      if (res.status === "success") {
        setSid(res.sid);
        onLogin();
      }
    }
  };
  return (
    <div className="postput-login-container">
      <h2>Login</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          tryLogin();
        }}
      >
        <div className="postput-form-group">
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
            }}
          />
        </div>
        <div className="postput-form-group">
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
        </div>
        <div className="button-container">
          <button type="submit">login</button>
        </div>
      </form>
    </div>
  );
}