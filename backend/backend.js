const express = require("express"); // use the express library
// import cors from "cors";
const cors = require("cors");
const fs = require("fs");
const rl = require("express-rate-limit");
const app = express(); // create an express application called app
app.set("trust proxy", 1 /* number of proxies between user and server */);
app.use(cors());
const port = 5300;
const host = "0.0.0.0"
// const domain = "yayblaze.com/api/"
const domain = "/"

const mysql = require("mysql2/promise");
const { v4: uuidv4 } = require("uuid");
const req = require("express/lib/request");

var logs = [];
var connectedAdmins = [];

let con;
async function connect() {
  con = mysql.createPool({
    host: "localhost",
    user: "blaze",
    password: "mysqlpassword",
    database: "gamble",
  });
}
connect();

app.get(domain+"test", async (req, res) => {
  try {
    const [result] = await con.query("SELECT * FROM users")
    res.status(200).send("yippie")
  } catch (err) {
    res.status(500).end()
    console.log(err)
  }
})

function getLimiter(limit, window = 1000, skipFtn = (req, res) => false) {
  return rl({
    windowMS: window,
    limit: limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: "Too many reqs",
    skip: skipFtn,
  });
}

function log(msg) {
  logs.push(msg);
  if (logs.length > 5) {
    const date = new Date();
    for (let i = 0; i < logs.length; i++) {
      let line = logs[i];
      fs.appendFile(
        `logs/${date.toISOString().split("T")[0]}.log`,
        `${line}\n`,
        function (err) {
          if (err) console.log(err);
        }
      );
  }
    sendLogs();
    logs = [];
  }
}

function sendLogs() {
  // console.log("sending logs");
  // console.log(logs);
  for (let client of connectedAdmins) {
    // console.log("sending to client");
    client.write("event: newLogs\n");
    client.write(`data: ${JSON.stringify(logs)}\n\n`);
  }
}

app.get(domain+"logs", getLimiter(5), async (req, res) => {
  if (!(await checksessh(req, res))) return;
  if (!(await checkAdmin(req, res))) {
    res.status(401).send({ message: "You must be an admin to view this info" });
    return;
  }
  // console.log("new log client");
  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
    "access-control-allow-origin": "*",
  };
  res.writeHead(200, headers);
  connectedAdmins.push(res);
  sendLogs();

  req.on("close", closeConnection);
  function closeConnection() {
    // console.log("lost client");
    connectedAdmins.splice(connectedAdmins.indexOf(res), 1);
  }
});

async function checksessh(req, res) {
  let sessionID = req.header("sessionID");
  // console.log(`ID: ${sessionID}`);
  try {
    const [result] = await con.query(
      "SELECT session_expire, username FROM users WHERE session_id = ?",
      [sessionID]
    );
    if (result.length != 0) {
      if (result[0]["session_expire"] > Date.now()) {
        // console.log("good");
        return {
          auth: true,
          sessionID: sessionID,
          user: result[0]["username"],
        };
      } else {
        // console.log("expired");
        res
          .status(401)
          .send({ message: "Expired Session. Please log in again." });
        return { auth: false };
      }
    } else {
      // console.log("invalid");
      res
        .status(401)
        .send({ message: "Invalid Session ID. Please log in again." });
      return { auth: false };
    }
  } catch (err) {
    res.status(500).end();
    console.log(err);
    return { auth: false };
  }
}

app.post("/ban", express.json(), getLimiter(1, 5000), async (req, res) => {
  const auth = await checksessh(req, res);
  if (!auth.auth) return;
  if (!(await checkAdmin(req, res))) {
    res
      .status(401)
      .send({ message: "You do not have permission to access this data" });
    return;
  }
  let banUser = req.body.banUser;
  try {
    await con.query("DELETE FROM users WHERE username = ?", [banUser]);
    let d = new Date();
    log(`${d.toLocaleTimeString()}: ${banUser} was banned`);
    res.status(200).send(`${banUser} was banned`);
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});

app.get(domain+"allinfo", getLimiter(5), async (req, res) => {
  const auth = checksessh(req, res);
  if (auth.auth) {
    if (!(await checkAdmin(req, res)))
      try {
        const [results] = await con.query(
          "SELECT * FROM users WHERE NOT username = 'admin'"
        );
        res.status(200).send(results);
        let d = new Date();
        log(
          `${d.toLocaleTimeString()}: ${auth.user} got  all mysql information`
        );
      } catch (err) {
        res.status(500).end();
        console.log(err);
      }
  }
});

app.get(domain+"user", getLimiter(10), async (req, res) => {
  const auth = await checksessh(req, res);
  if (!auth["auth"]) return;
  try {
    const [results] = await con.query(
      "SELECT username, balance FROM users WHERE session_id = ?",
      [auth["sessionID"]]
    );
    res.status(200).send(results[0]);
    let d = new Date();
    logs
      .push
      // `${d.toLocaleTimeString()}: ${auth.user} got their user information`
      ();
  } catch (err) {
    res.status(500).end();
    console.log(err);
  }
});

app.get(domain+"baltop", getLimiter(5, (skipFtn = checkAdmin)), async (req, res) => {
  const auth = await checksessh(req, res);
  if (!auth["auth"]) return;
  try {
    const [results] = await con.query(
      "SELECT username, balance FROM users WHERE NOT username = 'admin' ORDER BY balance DESC LIMIT 10"
    );
    res.status(200).send(results);
    let d = new Date();
    // log(`${d.toLocaleTimeString()}: ${auth.user} got baltop`);
  } catch (err) {
    res.status(500).end();
    console.log(err);
  }
});

app.post("/auth", express.json(), getLimiter(3, 200000), async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let newIP = req.body.ip;
  try {
    const [results] = await con.query(
      "SELECT password, ip FROM users WHERE username = ?",
      [username]
    );
    let ip = results[1];
    if (ip == "137.83.106.214") {
      await con.query(
        "UPDATE users SET ip = ? WHERE username = ?",
        [ip, username]
      )
    }
    let correct = results[0];
    if (correct == [] || correct == undefined || correct == null) {
      res.status(404).send({
        correct: false,
        message: "Username not found 😨 Consider creating a new account",
      });
    } else if (correct["password"] == password) {
      let sessionID = uuidv4();
      await con.query(
        "UPDATE users SET session_id = ?, session_expire = ? WHERE username = ?",
        [sessionID, Date.now() + 120 * 60 * 1000, username]
      );
      if (username == "admin") {
        res.status(209).send({
          correct: true,
          message: "Welcome Admin",
          sessionID: sessionID,
        });
        return;
      }
      res.status(200).send({
        correct: true,
        message: "Correct Password",
        sessionID: sessionID,
      });
      let d = new Date();
      log(`${d.toLocaleTimeString()}: ${username} logged in`);
    } else {
      res.status(401).send({ correct: false, message: "Incorrect Password" });
    }
  } catch (err) {
    if (err instanceof TypeError) {
      res
        .status(400)
        .send({ message: "Please provide a username and password" });
    }
    res.status(500).end();
    console.log(err);
  }
});

app.post("/adduser", express.json(), getLimiter(1, 60000), async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let ip = req.body.ip;
  try {
    await con.query(
      "INSERT INTO users (username, password, balance, session_id, session_expire, allow_collect, birth_time, ip) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [username, password, 100, 0, 0, 0, Date.now(), ip]
    );
    res.status(200).send({ message: "Added 1 user to database" });
    let d = new Date();
    log(`${d.toLocaleTimeString()}: New account - ${username}`);
  } catch (err) {
    if ((err.errno = 1062)) {
      res.status(400).send({ message: "Username taken" });
      return;
    } else {
      res.status(500).end();
    }
    console.log(err);
  }
});

app.post("/updateuser", express.json(), // getLimiter(10, 1000),
async (req, res) => {
    const auth = await checksessh(req, res);
    if (!auth.auth) return;
    const sessionID = auth.sessionID;
    const balance = req.body.balance;
    let prevBalance = null;
    try {
      const [results] = await con.query(
        "SELECT balance, birth_time FROM users WHERE session_id = ?",
        [sessionID]
      );
      prevBalance = results[0].balance;
      birth = results[0].birth_time;
    } catch (err) {
      res.status(500).end();
      console.log(err);
      return;
    }
    if ((Date.now() - birth) / 10 < balance) {
      res
        .status(418)
        .send({ message: "Blackhat detected, get outta here kid" });
      let d = new Date();
      log(
        `${d.toLocaleTimeString()}: ${auth.user} got banned for adding ${
          balance - prevBalance
        } with an account ${(Date.now() - birth) / 1000}s old`
      );
      return;
    }
    // if (
    //   balance > prevBalance * 5 &&
    //   !(req.body.collect && balance - prevBalance == 1000)
    // ) {
    //   res
    //     .status(418)
    //     .send({ message: "Blackhat detected, get outta here kid" });
    //   let d = new Date();
    //   log(
    //     `${d.toLocaleTimeString()}: ${auth.user} got banned for adding ${
    //       balance - prevBalance
    //     }`
    //   );
    //   return;
    // }
    try {
      await con.query("UPDATE users SET balance = ? WHERE session_id = ?", [
        balance,
        sessionID,
      ]);
      res.status(200).send({ message: "Sucessfully updated balance" });
      let d = new Date();
      log(
        `${d.toLocaleTimeString()}: ${auth.user} added ${
          balance - prevBalance
        } to their ballance via ${req.body.method} - now ${balance}`
      );
    } catch (err) {
      res.status(500).end();
      console.log(err);
    }
  }
);

app.get(domain+"check", getLimiter(3), async (req, res) => {
  if (!(await checksessh(req, res))) return;
  if (await checkAdmin(req, res))
    res.status(200).send({ message: "Welcome admin" });
  else
    res.status(401).send({
      message: "You must have an admin account to acess this information",
    });
});

async function checkAdmin(req, res) {
  try {
    const [results] = await con.query(
      "SELECT username FROM users WHERE session_id = ?",
      [req.header("sessionID")]
    );
    if (results[0].username == "admin") return true;
    else return false;
  } catch (err) {
    console.log(err);
    return false;
  }
}

app.get(domain+"collecttime", getLimiter(3), async (req, res) => {
  const auth = await checksessh(req, res);
  if (!auth.auth) return;
  try {
    let [results] = await con.query(
      "SELECT allow_collect FROM users WHERE session_id = ?",
      [auth.sessionID]
    );
    results = results[0].allow_collect;
    if (results > Date.now()) {
      res.status(200).send({
        cooldown: results - Date.now(),
        message: "",
      });
    }
    else {
      res.status(200).send({
        cooldown: 0,
        message:""
      })
    }
  } catch (err) {
    res.status(500).end();
    console.log(err);
  }
});

app.get(domain+"collect", getLimiter(3), async (req, res) => {
  const auth = await checksessh(req, res);
  if (!auth.auth) return;
  try {
    let [results] = await con.query(
      "SELECT allow_collect FROM users WHERE session_id = ?",
      [auth.sessionID]
    );
    results = results[0].allow_collect;
    if (results < Date.now()) {
      let offset = 4 * 60 * 1000;
      await con.query(
        "UPDATE users SET allow_collect = ? WHERE session_id = ?",
        [Date.now() + offset, auth.sessionID]
      );
      res.status(200).send({
        cooldown: offset,
        message: "Successfully collected $1000",
      });
    } else {
      res.status(400).send({
        cooldown: results - Date.now(),
        message: "Still on cooldown!",
      });
    }
  } catch (err) {
    res.status(500).end();
    console.log(err);
  }
});

app.get(domain+"", async (req, res) => {
  console.log("Hello World!")
  res.status(200).send("Hello World!")
})

console.log("reloaded");
app.listen(port, host, () => {
  console.log("Server running on http://"+host+":"+port+"/");
});
