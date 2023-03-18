import express from "express";
import expressWs from "express-ws";
import cookieParser from "cookie-parser";
import passport from "passport";
import session from "express-session";
import sqlite3 from "connect-sqlite3";
import cors from "cors";
import authRouter from "./auth.js";
import wsConnection from "./socket.js";

const app = express();
const wsInstance = expressWs(app);
const SQLiteStore = sqlite3(session);

app.use(express.static("dist"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
  // optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));
const sessionStore = new SQLiteStore({ db: "sessions.db", dir: "." });
app.use(session({
  secret: "ut-code postput 12345",
  resave: false,
  saveUninitialized: false,
  cookie: {httpOnly: false},
  store: sessionStore,
}));
app.use(passport.authenticate("session"));
app.use("/", authRouter);

// app.get("/login/sid", (req, res) => {
//   console.log(req.session);
//   res.send(req.session.id);
// });
app.ws("/", (ws, req) => {
  const sid = req.query.sid;
  sessionStore.get(sid, (err, session) => {
    console.log(err);
    console.log(session);
    if (session && session.passport.user) {
      console.log("new client");
      wsConnection(session.passport.user.id, ws);
    }

  });
});

const port = process.env["PORT"] || 3000;
console.log(`http://localhost:${port}/`);
app.listen(port);
