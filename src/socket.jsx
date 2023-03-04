import { createContext, useContext, useEffect, useState, useRef } from "react";

const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = (props) => {
  const [ws, setWs] = useState(null);
  const [send, setSend] = useState();
  const [messages, setMessages] = useState([]);
  useEffect(() => {
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
  }, []);
  useEffect(() => {
    if (ws != null) {
      ws.addEventListener("message", (event) => {
        setMessages(JSON.parse(event.data));
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
      }}
    >
      {props.children}
    </SocketContext.Provider>
  );
};
