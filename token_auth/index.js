const express = require('express');
const onFinished = require('on-finished');
const bodyParser = require('body-parser');
const { auth0Login, auth0LoginRefreshToken } = require('./auth0');
const { Session } = require('./session');
const path = require('path');
const port = 3000;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const SESSION_KEY = 'Authorization';

const sessions = new Session();

app.use((req, res, next) => {
  let currentSession = {};
  let sessionId = req.get(SESSION_KEY);

  if (sessionId) {
    currentSession = sessions.get(sessionId);
    if (!currentSession) {
      currentSession = {};
      sessionId = sessions.init(res);
    }
  } else {
    sessionId = sessions.init(res);
  }

  req.session = currentSession;
  req.sessionId = sessionId;

  onFinished(req, () => {
    const currentSession = req.session;
    const sessionId = req.sessionId;
    sessions.set(sessionId, currentSession);
  });

  next();
});

app.get('/', async (req, res) => {
  console.log('GET /')
  if (req.session.access_token) {
    const tokenLifetime = req.session.expires_at - Math.floor(Date.now() / 1000);
    if (tokenLifetime <= 30) {
      const response = await auth0LoginRefreshToken(req.session.refresh_token);
      const responseObj = JSON.parse(response);
      req.session.access_token = responseObj.access_token;
      req.session.expires_at = Math.floor(Date.now() / 1000) + responseObj.expires_in;
      console.log(`token refreshed
        ${response}
      `);
    }

    return res.json({
      username: req.session.username,
      logout: 'http://localhost:3000/logout'
    });
  }
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get("/logout", (req, res) => {
  sessions.destroy(req, res);
  res.redirect("/");
});


app.post("/api/login", async (req, res) => {
  const { login, password } = req.body;
  await auth0Login(login, password)
    .then((response) => {
      const result = JSON.parse(response);
      console.log(result)
      req.session.username = login;
      req.session.login = login;
      req.session.access_token = result.access_token;
      req.session.expires_at = Math.floor(Date.now() / 1000) + result.expires_in;
      req.session.refresh_token = result.refresh_token;
      res.json({ token: req.sessionId });
    })
    .catch((error) => {
      console.error(error);
      res.status(401).send();
    })
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

