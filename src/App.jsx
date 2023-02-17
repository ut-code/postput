import { useState } from "react";
// import reactLogo from './assets/react.svg'
// import './App.css'
import { useSocket } from "./socket";

import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";

function App() {
  const [count, setCount] = useState(0);
  const { send, messages } = useSocket();

  const [text, setText] = useState("");
  return (
    <>
      useStateのテスト:
      <Button onClick={() => setCount((count) => count + 1)}>
        count is {count}
      </Button>
      <Grid container spacing={1} alignItems="center">
        <Grid item xs={12}>
          メッセージ一覧:
        </Grid>
        {messages.map((m) => (
          <>
            <Grid item xs={12} key={m}>
              {m}
            </Grid>
          </>
        ))}
        <Grid item xs>
          <TextField
            fullWidth
            variant="standard"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
            }}
            label="送信するテキスト"
          />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            onClick={() => {
              send(text);
              setText("");
            }}
            endIcon={<SendIcon />}
          >
            送信
          </Button>
        </Grid>
      </Grid>
    </>
  );
}

export default App;
