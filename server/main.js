import express from "express";
import expressWs from "express-ws";
import cookieParser from "cookie-parser";
import passport from "passport";
import session from "express-session";
import sqlite3 from "connect-sqlite3";
import cors from "cors";
import authRouter from "./auth.js";
import wsConnection from "./socket.js";

const app = express()
const wsInstance = expressWs(app);
const SQLiteStore = sqlite3(session);

app.use(express.static("dist"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
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

app.ws("/", (ws, req) => {
  if (req.session) {
    console.log("new client");
    console.log(req.session);
    console.log(req.user);
    wsConnection(req.user.name, ws);
  }
});

const port = process.env["PORT"] || 3000;
console.log(`http://localhost:${port}/`);
app.listen(port);
