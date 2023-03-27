import { useState, useEffect } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import SendIcon from "@mui/icons-material/Send";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import Badge from "@mui/material/Badge";
import Chip from "@mui/material/Chip";
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
  const { tags, addTag } = props;
  const [tagInput, setTagInput] = useState("");
  const addTag2 = () => {
    if (tagInput !== "" && tagInput !== "#") {
      // 先頭の#は不要
      const tagInputWithoutSharp = tagInput.slice(1);
      if (tags.indexOf(tagInputWithoutSharp) === -1) {
        addTag(tagInputWithoutSharp);
        setTagInput("");
      }
    }
  };
  return (
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
      size={tagInput.length || 7}
      placeholder="タグを追加"
      onKeyPress={(e) => {
        if (e.isComposing || e.keyCode === 229) {
          return;
        }
        if (e.key === "Enter") {
          addTag2();
        }
        return false;
      }}
      onBlur={addTag2}
    />
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
  const { tagname, onDelete, onClick } = props;
  return (
    <span style={{ paddingLeft: 2, paddingRight: 2 }}>
      <Chip
        color="error"
        onDelete={onDelete}
        onClick={onClick}
        size="small"
        label={"#" + tagname}
      />
    </span>
  );
}
function LargeTag(props) {
  const { tagname, onDelete, onClick } = props;
  return (
    <span style={{ paddingLeft: 2, paddingRight: 2 }}>
      <Chip
        color="error"
        variant="outlined"
        onDelete={onDelete}
        onClick={onClick}
        label={"#" + tagname}
      />
    </span>
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
    if (loginState) {
      socket.connect();
    }
  }, [loginState, socket]);

  // 入力欄に入力中のテキストとタグ
  const [textToSend, setTextToSend] = useState("");
  const [tagsToSend, setTagsToSend] = useState([]);
  const [currentTags, setCurrentTags] = useState([]);
  useEffect(() => {
    socket.subscribe(currentTags);
    setTagsToSend(currentTags);
  }, [currentTags]);

  const headerHeight = 60;
  const footerHeight = 120;

  const [keepTagName, setKeepTagName] = useState(".keep-");
  useEffect(() => {
    setKeepTagName(`.keep-${socket.userId}`);
  }, [setKeepTagName, socket.userId]);

  const [searchTagText, setSearchTagText] = useState("");

  if (!loginState) {
    // まだログインしてない場合はこれだけ表示して終わり
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
        <Box sx={{ width: "100%", height: "100%", overflow: "auto" }}>
          <Stack sx={{ m: 2 }} spacing={3}>
            <Autocomplete
              disablePortal
              options={socket.recentTags
                .sort((a, b) =>
                  a.name > b.name ? 1 : a.name < b.name ? -1 : 0
                )
                .map((t) => t.name)}
              renderInput={(params) => (
                <TextField {...params} label="タグを検索" />
              )}
              inputValue={searchTagText}
              onInputChange={(e, value) => setSearchTagText(value)}
              value={null}
              onChange={(e, value) => {
                if (currentTags.indexOf(value) === -1) {
                  setCurrentTags(currentTags.concat([value]));
                }
                setSearchTagText("");
              }}
            />
            <Stack spacing={1}>
              <div>固定タグ</div>
              {socket.favoriteTags.map((t) => (
                <div>
                  <Tag
                    tagname={t.name}
                    onDelete={() => {
                      socket.setFavoriteTags(
                        socket.favoriteTags.filter((tag) => tag.name !== t.name)
                      );
                    }}
                    onClick={() => {
                      if (currentTags.indexOf(t.name) === -1) {
                        setCurrentTags(currentTags.concat([t.name]));
                      }
                    }}
                  />
                </div>
              ))}
              <button
                onClick={() => {
                  socket.setFavoriteTags(currentTags);
                }}
              >
                今見てる奴を固定タグに設定する(仮)
              </button>
            </Stack>
            <p>
              <a
                href="#"
                onClick={() => {
                  setCurrentTags([keepTagName]);
                }}
              >
                保留メッセージ
                <Badge badgeContent={socket.keepNum} color="primary">
                  <WatchLaterIcon color="action" />
                </Badge>
              </a>
            </p>
            <Stack spacing={1}>
              <div>#最近更新されたタグ</div>
              {socket.recentTags.map((t) => (
                <div>
                  <Tag
                    tagname={t.name}
                    onClick={() => {
                      if (currentTags.indexOf(t.name) === -1) {
                        setCurrentTags(currentTags.concat([t.name]));
                      }
                    }}
                  />
                </div>
              ))}
            </Stack>
          </Stack>
        </Box>
      </Box>
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "70%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            flexBasis: "auto",
            flexGrow: 0,
            flexShrink: 0,
          }}
        >
          <Paper elevation={3} sx={{ m: 1 }}>
            <Grid container alignItems="center" sx={{ height: "100%", p: 1 }}>
              {currentTags.map((t) => (
                <Grid item>
                  <LargeTag
                    tagname={t}
                    onDelete={() => {
                      setCurrentTags(currentTags.filter((tag) => tag !== t));
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>
        <Box
          sx={{
            flexBasis: "auto",
            flexGrow: 1,
            flexShrink: 1,
            overflow: "auto",
          }}
        >
          <Stack spacing={1}>
            {socket.messages.length === 0 && (
              <p>サイドバーから表示するタグを選択してください</p>
            )}
            {socket.messages.map((m) => (
              <Box key={m.id} sx={{ border: 1 }}>
                <Name name={m.user.username} />
                <ShowDate date={new Date(m.sendTime)} />
                {m.tags.map((t) => (
                  <>
                    <Tag
                      tagname={t}
                      onDelete={() => {
                        socket.updateMessage(
                          m.id,
                          m.tags.filter((tag) => tag !== t)
                        );
                      }}
                    />
                  </>
                ))}
                <TagEdit
                  tags={[]}
                  addTag={(tag) => {
                    socket.updateMessage(m.id, m.tags.concat([tag]));
                  }}
                />
                <IconButton
                  size="small"
                  color={m.tags.indexOf(keepTagName) >= 0 ? "primary" : ""}
                  onClick={() => {
                    if (m.tags.indexOf(keepTagName) >= 0) {
                      socket.updateMessage(
                        m.id,
                        m.tags.filter((t) => t !== keepTagName)
                      );
                    } else {
                      socket.updateMessage(m.id, m.tags.concat([keepTagName]));
                    }
                  }}
                >
                  <WatchLaterIcon fontSize="small" />
                </IconButton>
                <Message text={m.text} />
                {m.replyNum}件の返信
              </Box>
            ))}
          </Stack>
        </Box>
        <Box
          sx={{
            flexBasis: "auto",
            flexGrow: 0,
            flexShrink: 0,
          }}
        >
          <Paper elevation={3} sx={{ m: 1 }}>
            <Grid container spacing={1} alignItems="baseline">
              <Grid item>タグ:</Grid>
              <Grid item>
                {tagsToSend.map((t) => (
                  <Tag
                    tagname={t}
                    onDelete={() =>
                      setTagsToSend(
                        tagsToSend.filter((eachTag) => eachTag !== t)
                      )
                    }
                  />
                ))}
              </Grid>
              <Grid item>
                <TagEdit
                  tags={tagsToSend}
                  addTag={(t) => setTagsToSend(tagsToSend.concat([t]))}
                />
              </Grid>
            </Grid>
            <SendMessage
              text={textToSend}
              setText={setTextToSend}
              send={() => {
                socket.send({
                  text: textToSend, // 内容
                  tags: tagsToSend, // タグ
                });
                setTextToSend("");
              }}
            />
          </Paper>
        </Box>
      </Box>
    </>
  );
}

export default App;
