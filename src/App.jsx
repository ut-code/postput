import { useState } from "react";
// import reactLogo from './assets/react.svg'
// import './App.css'
import { useSocket } from "./socket";

import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";

function App() {
  const [count, setCount] = useState(0);
  const { send, messages } = useSocket();

  const [text, setText] = useState("");
  const headerHeight = 60;
  const footerHeight = 60;
  return (
    <>
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: headerHeight,
        }}
      >
        メッセージ一覧:
      </Box>
      <Box sx={{ overflow: "auto", height: "100%" }}>
        <Box sx={{ height: headerHeight }} />
        <Stack spacing={1}>
          {messages.map((m) => (
            <Box key={m.id} sx={{ border: 1 }}>
              {m.name +
                " " +
                new Date(m.sendTime).toDateString() +
                " " +
                new Date(m.sendTime).toTimeString() +
                " " +
                JSON.stringify(m.tags)}{" "}
              <br />
              {m.text}
            </Box>
          ))}
        </Stack>
        <Box sx={{ height: footerHeight }} />
      </Box>
      <Box
        sx={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: "100%",
          height: footerHeight,
        }}
      >
        <Grid container spacing={1} alignItems="center">
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
                send({ text: text });
                setText("");
              }}
              endIcon={<SendIcon />}
            >
              送信
            </Button>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default App;
