import { useState } from "react";
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
    <>
      <TextField
        value={username}
        label="username"
        onChange={(e) => {
          setUsername(e.target.value);
        }}
      />
      <TextField
        value={password}
        label="password"
        onChange={(e) => {
          setPassword(e.target.value);
        }}
      />
      <Button onClick={tryLogin}>ログイン</Button>
    </>
  );
}
