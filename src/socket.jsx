import { createContext, useContext, useEffect, useState, useRef } from "react";

const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = (props) => {
  const [ws, setWs] = useState(null);
  const [send, setSend] = useState();
  const [messages, setMessages] = useState([]);
  const [tags, setTags] = useState([]);
  const [recentTags, setRecentTags] = useState([]);
  const [favoriteTags, setFavoriteTags] = useState([]);
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
        } else if (json.type === "tagAll") {
          setTags(json.tags);
        } else if (json.type === "tagRecentUpdate") {
          setRecentTags(json.tags);
        } else if (json.type === "user") {
          setUsername(json.username);
          setUserId(json.userId);
          setFavoriteTags(json.favoriteTags);
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
    }
  }, [ws, userId]);

  return (
    <SocketContext.Provider
      value={{
        send: send,
        messages: messages,
        tags: tags,
        recentTags: recentTags,
        connect: connect,
        username: username,
        setSid: setSid,
        favoriteTags: favoriteTags,
      }}
    >
      {props.children}
    </SocketContext.Provider>
  );
};
