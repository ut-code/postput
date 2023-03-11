import { useState } from "react";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import { useSocket } from "./socket";

function ShowDate(props) {
  const { date } = props;
  return (
    <>
      {date.getMonth() + 1}月{date.getDate()}日{date.getHours()}:
      {date.getMinutes() < 10
        ? "0" + date.getMinutes().toString()
        : date.getMinutes()}
    </>
  );
}

function TagEdit(props) {
  const { tags, setTags } = props;
  const [tagInput, setTagInput] = useState("");
  const addTag = () => {
    if (tagInput !== "" && tagInput !== "#") {
      // 先頭の#は不要
      const tagInputWithoutSharp = tagInput.slice(1);
      if (tags.indexOf(tagInputWithoutSharp) === -1) {
        setTags(tags.concat([tagInputWithoutSharp]));
        setTagInput("");
      }
    }
  };
  return (
    <Grid container spacing={1} alignItems="baseline">
      <Grid item>タグ:</Grid>
      {tags.map((t) => (
        <Grid item>
          <span key={t}>#{t}</span>
        </Grid>
      ))}
      <Grid item>
        <input
          value={tagInput}
          onChange={(e) => {
            let value = e.target.value;
            if (!value.startsWith("#")) {
              value = "#" + value;
            }
            if (value === "#") {
              value = "";
            }
            setTagInput(value);
          }}
          size="small"
          placeholder="タグを追加"
          onKeyPress={(e) => {
            if (e.isComposing || e.keyCode === 229) {
              return;
            }
            if (e.key === "Enter") {
              addTag();
            }
            return false;
          }}
        />
      </Grid>
    </Grid>
  );
}

function SendMessage(props) {
  const { text, setText, send } = props;
  return (
    <Grid container spacing={1} alignItems="baseline">
      <Grid item xs>
        <TextField
          fullWidth
          variant="standard"
          multiline
          value={text}
          onChange={(e) => {
            setText(e.target.value);
          }}
          placeholder="送信するテキスト"
        />
      </Grid>
      <Grid item>
        <Button variant="contained" onClick={send} endIcon={<SendIcon />}>
          送信
        </Button>
      </Grid>
    </Grid>
  );
}

function Tag(props) {
  const { tagname } = props;
  return (<>
    <span class="tag">
    #{tagname}
    </span>
  </>)
}

function Name(props) {
  const { name } = props;
  return (<>
    <span class="name">{name}</span>
  </>)
}

function Message(props) {
  const { text } = props;
  return (<>
    <p class="message">{text}</p>
  </>)
}

function App() {
  const [count, setCount] = useState(0);
  const socket = useSocket();

  // 入力欄に入力中のテキストとタグ
  const [text, setText] = useState("");
  const [tags, setTags] = useState([]);

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
      <Box sx={{ overflow: "auto", position: "absolute", top: headerHeight, bottom: footerHeight, left: 0, width: "100%", }}>
        <Stack spacing={1}>
          {socket.messages.map((m) => (
            <Box key={m.id} sx={{ border: 1 }}>
              <Name name={m.name}/>
              <ShowDate date={new Date(m.sendTime)} />
              {m.tags.map((t) => (
                <Tag tagname={t}/>
              ))}
              <br />
              <Message text={m.text}/>
            </Box>
          ))}
        </Stack>
      </Box>
      <Box sx={{ position: "absolute", left: 0, bottom: 0, width: "100%", height: footerHeight, }}>
        <TagEdit tags={tags} setTags={setTags} />
        <SendMessage
          text={text}
          setText={setText}
          send={() => {
            socket.send({
              name: "名無し", //送信者
              text: text, //内容
              tags: tags, //タグ
            });
            setText("");
          }}
        />
      </Box>
    </>
  );
}

export default App;
