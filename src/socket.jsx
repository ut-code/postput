import { createContext, useContext, useEffect, useState, useRef } from "react";

const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = (props) => {
  const [ws, setWs] = useState(null);
  const [send, setSend] = useState();
  const [messages, setMessages] = useState([]);
  const [tags, setTags] = useState([]);
  const [recentTags, setRecentTags] = useState([]);
  const [username, setUsername] = useState("");
  const connect = () => {
    if (ws == null) {
      const ws = new WebSocket("ws://localhost:3000/");
      setWs(ws);
      ws.onerror = () => {
        const ws2 = new WebSocket("wss://postput-test-server.onrender.com/");
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
          setUsername(json.name);
        } else if (json.type === "error") {
          console.error("server error: " + json.message);
        }
      });
      ws.addEventListener("open", (event) => {
        ws.send(JSON.stringify({ type: "fetch" }));
      });
      setSend((send) => (message) => {
        ws.send(JSON.stringify({ ...message, type: "createMessage" }));
      });
    }
  }, [ws]);

  return (
    <SocketContext.Provider
      value={{
        send: send,
        messages: messages,
        tags: tags,
        recentTags: recentTags,
        connect: connect,
        username: username,
      }}
    >
      {props.children}
    </SocketContext.Provider>
  );
};
