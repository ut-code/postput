import express from "express";
import expressWs from "express-ws";
const wsInstance = expressWs(express());
const app = wsInstance.app;
import * as database from "./database.js";

app.use(express.static("dist"));

app.ws("/", function (ws, req) {
  const broadcast = async () => {
    const messages = await database.getMessageTextAll();
    wsInstance.getWss("/").clients.forEach((c) => {
      c.send(messages);
    });
  };
  ws.on("message", async function (msg) {
    console.log(msg);
    const json = JSON.parse(msg);
    if (json.type === "createMessage") {
      await database.createMessage(json);
      await broadcast();
    } else if (json.type === "fetch") {
      const messages = await database.getMessageTextAll();
      ws.send(messages);
    }
  });
  // console.log('socket', req.testing);
});

const port = process.env["PORT"] || 3000;
console.log(`http://localhost:${port}/`);
app.listen(port);
