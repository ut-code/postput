import express from "express";
import expressWs from "express-ws";
const wsInstance = expressWs(express());
const app = wsInstance.app;

app.use(express.static("dist"));

const messages = [];

app.ws("/", function (ws, req) {
  const broadcast = () => {
    wsInstance.getWss("/").clients.forEach((c) => {
      c.send(JSON.stringify(messages));
    });
  };
  ws.on("message", function (msg) {
    console.log(msg);
    const json = JSON.parse(msg);
    if (json.type === "message") {
      messages.push(json.data);
      broadcast();
    } else if (json.type === "fetch") {
      ws.send(JSON.stringify(messages));
    }
  });
  // console.log('socket', req.testing);
});

const port = process.env["PORT"] || 3000;
console.log(`http://localhost:${port}/`);
app.listen(port);
