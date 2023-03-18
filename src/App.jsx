import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import { useSocket } from "./socket";
import Login from "./login";

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
          <a
            href="#"
            onClick={() => setTags(tags.filter((eachTag) => eachTag !== t))}
          >
            <Tag tagname={t}></Tag>
          </a>
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
  return (
    <>
      <span class="tag">#{tagname}</span>
    </>
  );
}

function Name(props) {
  const { name } = props;
  return (
    <>
      <span class="name">{name}</span>
    </>
  );
}

function Message(props) {
  const { text } = props;
  return (
    <>
      <br />
      <p class="message">{text}</p>
    </>
  );
}

function App() {
  const [loginState, setLoginState] = useState(false);
  const socket = useSocket();
  useEffect(() => {
    if(loginState){
      socket.connect();
    }
  }, [loginState, socket])

  // 入力欄に入力中のテキストとタグ
  const [text, setText] = useState("");
  const [tags, setTags] = useState([]);
  const [currentTags, setCurrentTags] = useState([]);
  useEffect(() => {
    socket.subscribe(currentTags);
  }, [currentTags]);

  const headerHeight = 60;
  const footerHeight = 120;

  if (!loginState) { // まだログインしてない場合はこれだけ表示して終わり
    return (
      // ログインページは login.tsx にある
      <Login
        onLogin={() => {
          setLoginState(true);
        }}
        setSid={socket.setSid}
      />
    );
  }

  return (
    <>
      <link rel="stylesheet" href="../style.css"></link>
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "30%",
          height: "100%",
          background: "skyblue",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "1%",
            left: "10%",
            width: "80%",
            height: "10%",
            background: "yellowgreen",
          }}
        >
          タグを検索
          <select>
            {socket.recentTags.map((t) => (
              <option>
                <Tag tagname={t.name}></Tag>
              </option>
            ))}
          </select>
        </Box>
        <Box
          sx={{
            position: "absolute",
            top: "15%",
            left: "10%",
            width: "80%",
            height: "30%",
            background: "yellowgreen",
          }}
        >
          <p>#固定タグ</p>
          {socket.favoriteTags.map((t) => (
            <a
              href="#"
              onClick={() => {
                if (currentTags.indexOf(t.name) === -1) {
                  setCurrentTags(currentTags.concat([t.name]));
                }
              }}
            >
              <Tag tagname={t.name}></Tag>
              <br />
            </a>
          ))}
        </Box>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "10%",
            width: "80%",
            height: "25%",
            background: "yellowgreen",
          }}
        >
          <p>保留メッセージ</p>
          <p>
            ○件のメッセージが保留されています<button>一覧を見る</button>
          </p>
        </Box>
        <Box
          sx={{
            position: "absolute",
            top: "80%",
            left: "10%",
            width: "80%",
            height: "15%",
            background: "yellowgreen",
          }}
        >
          <p>#最近更新されたタグ</p>
          {socket.recentTags.map((t) => (
            <a
              href="#"
              onClick={() => {
                if (currentTags.indexOf(t.name) === -1) {
                  setCurrentTags(currentTags.concat([t.name]));
                }
              }}
            >
              <Tag tagname={t.name}></Tag>
              <br />
            </a>
          ))}
        </Box>
      </Box>
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "70%",
          height: "100%",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: headerHeight,
            background: "yellow",
          }}
        >
          メッセージ一覧:
          <p>
            今は
            {currentTags.map((t) => (
              <Tag tagname={t}></Tag>
            ))}
            を表示しています
          </p>
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
            {socket.messages
              .filter((m) => {
                //m.tags...メッセージにあるタグ
                let numberOfFoundTag = 0;
                for (const tag of m.tags) {
                  if (currentTags.indexOf(tag) != -1) numberOfFoundTag++;
                }
                return numberOfFoundTag > 0;
              })
              .map((m) => (
                <Box key={m.id} sx={{ border: 1 }}>
                  <Name name={m.user.username} />
                  <ShowDate date={new Date(m.sendTime)} />
                  {m.tags.map((t) => (
                    <Tag tagname={t} />
                  ))}
                  <Message text={m.text} />
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
          <TagEdit tags={tags} setTags={setTags} />
          <SendMessage
            text={text}
            setText={setText}
            send={() => {
              socket.send({
                text: text, //内容
                tags: tags, //タグ
              });
              setText("");
            }}
          />
        </Box>
      </Box>
    </>
  );
}

export default App;
