import express from "express";
import expressWs from "express-ws";
import cookieParser from "cookie-parser";
import passport from "passport";
import session from "express-session";
import sqlite3 from "connect-sqlite3";
import cors from "cors";
import * as database from "./database.js";
import authRouter from "./auth.js";

const wsInstance = expressWs(express());
const app = wsInstance.app;
var SQLiteStore = sqlite3(session);

app.use(express.static("dist"));
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(
  session({
    secret: "ut-code postput 12345",
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore({ db: "sessions.db", dir: "." }),
  })
);
app.use(passport.authenticate("session"));
app.use("/", authRouter);

const clients = [];
class Client {
  name;
  ws;
  constructor(name, ws) {
    this.name = name;
    this.ws = ws;
    console.log("client constructor");
  }
  send(data) {
    this.ws.send(JSON.stringify(data));
  }
  onError(message) {
    this.send({
      type: "error",
      message: message,
    });
  }
}

const broadcast = async () => {
  const messages = await database.getMessageAll(() => {});
  const tags = await database.getTagAll(() => {});
  const recentTags = await database.getTagRecentUpdate(() => {});
  for (const c of clients) {
    c.send({
      type: "messageAll",
      messages: messages,
    });
    c.send({
      type: "tagAll",
      tags: tags,
    });
    c.send({
      type: "tagRecentUpdate",
      tags: recentTags,
    });
  }
};

app.ws("/", (ws, req) => {
  if (req.user) {
    const c = new Client(req.user.username, ws);
    console.log("new client");
    console.log(req.user)
    clients.push(c);
    ws.on("message", async (msg) => {
      console.log(msg);
      const json = JSON.parse(msg);
      if (json.type === "createMessage") {
        await database.createMessage(json, c.onError);
        await broadcast();
      } else if (json.type === "fetch") {
        const messages = await database.getMessageAll(c.onError);
        c.send({ type: "user", name: req.user.username });
        c.send({
          type: "messageAll",
          messages: messages,
        });
        const tags = await database.getTagAll(c.onError);
        c.send({
          type: "tagAll",
          tags: tags,
        });
        const recentTags = await database.getTagRecentUpdate(c.onError);
        c.send({
          type: "tagRecentUpdate",
          tags: recentTags,
        });
      }
    });
  }else{
    console.log("username undefined");
  }
});

const port = process.env["PORT"] || 3000;
console.log(`http://localhost:${port}/`);
app.listen(port);
