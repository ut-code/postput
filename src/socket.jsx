import { createContext, useContext, useEffect, useState, useRef } from "react";

const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = (props) => {
  const [ws, setWs] = useState(null);
  const [send, setSend] = useState(() => () => {});
  const [subscribe, setSubscribe] = useState(() => () => {});
  const [setFavoriteTags, setSetFavoriteTags] = useState(() => () => {});
  const [messages, setMessages] = useState([]);
  const [recentTags, setRecentTags] = useState([]);
  const [favoriteTags, setFavoriteTagsLocal] = useState([]);
  const [userId, setUserId] = useState(0);
  const [username, setUsername] = useState("");
  const [sid, setSid] = useState("");
  const connect = async () => {
    if (ws == null) {
      // const sid = await(await fetch("http://localhost:3000/login/sid", {credentials:"include"})).text();
      const ws = new WebSocket(`ws://localhost:3000/?sid=${sid}`);
      setWs(ws);
      ws.onerror = async () => {
        // const sid = await(await fetch("https://postput-test-server.onrender.com/login/sid")).text();
        const ws2 = new WebSocket(
          `wss://postput-test-server.onrender.com/?sid=${sid}`
        );
        setWs(ws2);
        ws2.onerror = () => {
          console.log("WebSocket connection failed");
          setWs(null);
        };
      };
    }
  };
  useEffect(() => {
    if (ws != null) {
      ws.addEventListener("message", (event) => {
        const json = JSON.parse(event.data);
        console.log(json);
        if (json.type === "messageAll") {
          setMessages(json.messages);
        } else if (json.type === "messageAdd"){
          setMessages((messages) => (messages.concat([json.message])));
        } else if (json.type === "tagRecentUpdate") {
          setRecentTags(json.tags);
        } else if (json.type === "user") {
          setUsername(json.username);
          setUserId(json.userId);
        } else if (json.type === "tagFavorite"){
          setFavoriteTagsLocal(json.favoriteTags);
        } else if (json.type === "error") {
          console.error("server error: " + json.message);
        }
      });
      ws.addEventListener("open", (event) => {
        ws.send(JSON.stringify({ type: "fetch" }));
      });
    }
  }, [ws]);
  useEffect(() => {
    if (ws != null) {
      setSend((send) => (message) => {
        ws.send(
          JSON.stringify({ ...message, type: "createMessage" })
        );
      });
      setSubscribe((subscribe) => (tags) => {
        ws.send(JSON.stringify({type: "subscribe", tags: tags}));
      });
      setSetFavoriteTags((setFavoriteTags) => (tags) => {
        ws.send(JSON.stringify({type: "setFavoriteTags", favoriteTags:tags.map((t) => (typeof t === "string" ? t : t.name))}));
      })
    }
  }, [ws, userId]);

  return (
    <SocketContext.Provider
      value={{
        send: send,
        messages: messages,
        recentTags: recentTags,
        connect: connect,
        username: username,
        setSid: setSid,
        favoriteTags: favoriteTags,
        subscribe: subscribe,
        setFavoriteTags: setFavoriteTags,
      }}
    >
      {props.children}
    </SocketContext.Provider>
  );
};
