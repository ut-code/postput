import express from "express";
import expressWs from "express-ws";
const wsInstance = expressWs(express());
const app = wsInstance.app;

import { PrismaClient } from "@prisma/client";
const client = new PrismaClient();

app.use(express.static("dist"));

app.ws("/", function (ws, req) {
  const broadcast = async () => {
    const messages = await client.message.findMany();
    wsInstance.getWss("/").clients.forEach((c) => {
      c.send(JSON.stringify(messages.map((m) => (m.text))));
    });
  };
  ws.on("message", async function (msg) {
    console.log(msg);
    const json = JSON.parse(msg);
    if (json.type === "message") {
      // messages.push(json.data);
      await client.message.create({ data: { name: "test", text: json.data } });
      await broadcast();
    } else if (json.type === "fetch") {
      const messages = await client.message.findMany();
      ws.send(JSON.stringify(messages.map((m) => (m.text))));
    }
  });
  // console.log('socket', req.testing);
});

const port = process.env["PORT"] || 3000;
console.log(`http://localhost:${port}/`);
app.listen(port);
