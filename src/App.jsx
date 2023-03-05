import { useState } from "react";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import { useSocket } from "./socket";

function App() {
  const [count, setCount] = useState(0);
  const socket = useSocket();

  // 入力欄に入力中のテキストとタグ
  const [text, setText] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const headerHeight = 60;
  const footerHeight = 120;
  return (
    <>
      <link rel="stylesheet" href="../style.css"></link>
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
      <Box
        sx={{
          overflow: "auto",
          position: "absolute",
          top: headerHeight,
          bottom: footerHeight,
          left: 0,
          width: "100%",
        }}
      >
        <Stack spacing={1}>
          {socket.messages.map((m) => (
            <Box key={m.id} sx={{ border: 1 }}>
              {m.name}
              {new Date(m.sendTime).toDateString()}
              {new Date(m.sendTime).toTimeString()}
              {m.tags.map((t) => (
                <span key={t}>#{t}</span>
              ))}
              <br />
              {m.text}
            </Box>
          ))}
        </Stack>
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
          <Grid item xs={12}>
            タグ:
            {tags.map((t) => (
              <span key={t}>#{t}</span>
            ))}
            <TextField
              variant="standard"
              value={tagInput}
              onChange={(e) => {
                setTagInput(e.target.value);
              }}
              label="タグ"
            />
            <Button
              variant="contained"
              onClick={() => {
                setTags(tags.concat([tagInput]));
                setTagInput("");
              }}
            >
              タグを追加
            </Button>
          </Grid>
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
                socket.send({
                  name: "名無し", //送信者
                  text: text, //内容
                  tags: tags, //タグ
                });
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
