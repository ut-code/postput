import express from "express";
import passport from "passport";
import LocalStrategy from "passport-local";
import crypto from "crypto";
import * as database from "./database.js";

const router = express.Router();

passport.use(
  new LocalStrategy(async (username, password, cb) => {
    console.log(`login username=${username}, password=${password}`);
    const row = await database.getUser(username);
    // if (err) { return cb(err); }

    if (row == null) {
      console.log("create user");
      // return cb(null, false, { message: "Incorrect username or password." });
      var salt = crypto.randomBytes(16);
      crypto.pbkdf2(
        password,
        salt,
        310000,
        32,
        "sha256",
        async (err, hashedPassword) => {
          // if (err) { return next(err); }
          const row = await database.addUser(username, salt, hashedPassword);
          // if (err) { return next(err); }
          // user = {
          //   id: this.lastID,
          //   username: req.body.username
          // };
          // req.login(user, function(err) {
          //   if (err) { return next(err); }
          //   res.redirect('/');
          // });
          return cb(null, row);
        }
      );
    } else {
      console.log(`verify`);
      crypto.pbkdf2(
        password,
        row.salt,
        310000,
        32,
        "sha256",
        (err, hashedPassword) => {
          if (err) {
            return cb(err);
          }
          if (!crypto.timingSafeEqual(row.hashedPassword, hashedPassword)) {
            console.log("Incorrect username or password");
            return cb(null, false, {
              message: "Incorrect username or password.",
            });
          }
          console.log("login ok");
          return cb(null, row);
        }
      );
    }
  })
);

router.post(
  "/login/password",
  passport.authenticate("local", {
    successRedirect: "/login/success",
    failureRedirect: "/login/failure",
  })
);
router.get("/login/success", (req, res) => {
  console.log("success");
  res.send("success");
});
router.get("/login/failure", (req, res) => {
  res.send("failure");
});

passport.serializeUser((user, cb) => {
  process.nextTick(() => {
    cb(null, {id: user.id, username: user.username});
  });
});

passport.deserializeUser((user, cb) => {
  process.nextTick(() => {
    return cb(null, user);
  });
});

export default router;
