import express from "express";
import expressWs from "express-ws";
import cookieParser from "cookie-parser";
import passport from "passport";
import session from "express-session";
import sqlite3 from "connect-sqlite3";
import * as database from "./database.js";
import authRouter from "./auth.js";

const wsInstance = expressWs(express());
const app = wsInstance.app;
var SQLiteStore = sqlite3(session);

app.use(express.static("dist"));
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
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

app.ws("/", (ws, req) => {
  const onError = (message) => {
    wsInstance.getWss("/").clients.forEach((c) => {
      c.send(
        JSON.stringify({
          type: "error",
          message: message,
        })
      );
    });
  };
  const broadcast = async () => {
    const messages = await database.getMessageAll(onError);
    const tags = await database.getTagAll(onError);
    const recentTags = await database.getTagRecentUpdate(onError);
    wsInstance.getWss("/").clients.forEach((c) => {
      c.send(
        JSON.stringify({
          type: "messageAll",
          messages: messages,
        })
      );
      c.send(
        JSON.stringify({
          type: "tagAll",
          tags: tags,
        })
      );
      c.send(
        JSON.stringify({
          type: "tagRecentUpdate",
          tags: recentTags,
        })
      );
    });
  };
  ws.on("message", async (msg) => {
    console.log(msg);
    const json = JSON.parse(msg);
    if (json.type === "createMessage") {
      await database.createMessage(json, onError);
      await broadcast();
    } else if (json.type === "fetch") {
      const messages = await database.getMessageAll(onError);
      ws.send(
        JSON.stringify({
          type: "messageAll",
          messages: messages,
        })
      );
      const tags = await database.getTagAll(onError);
      ws.send(
        JSON.stringify({
          type: "tagAll",
          tags: tags,
        })
      );
      const recentTags = await database.getTagRecentUpdate(onError);
      ws.send(
        JSON.stringify({
          type: "tagRecentUpdate",
          tags: recentTags,
        })
      );
    }
  });
  // console.log('socket', req.testing);
});

const port = process.env["PORT"] || 3000;
console.log(`http://localhost:${port}/`);
app.listen(port);
