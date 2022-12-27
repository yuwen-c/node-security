const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
// require('https').globalAgent.options.rejectUnauthorized = false;

require('dotenv').config();

const config = {
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
};

const GOOGLE_AUTH_OPTIONS = {
  clientID: config.clientID,
  clientSecret: config.CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
};

const verifyCallback = (accessToken, refreshToken, profile, done) => {
  done(null, profile);
};

passport.use(new GoogleStrategy(GOOGLE_AUTH_OPTIONS, verifyCallback));

const app = express();

app.use(helmet());
app.use(passport.initialize());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// middleware passed to get secret
const checkLoggedIn = (req, res, next) => {
  const isLoggedIn = true; // todo
  if (!isLoggedIn) {
    return res.status(401).json({ error: 'you must log in first' });
  }
  next();
};

// app.use((req, res, next) => {
//   const isLoggedIn = true; // todo
//   if (!isLoggedIn) {
//     return res.status(401).json({error:'you must log in first'})
//   }
//   next();
// });

// where google log in kicks off
app.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['email'],
  })
);

// for google sends back the authorization code response
app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/failure',
    successRedirect: '/',
    session: false,
  }),
  (req, res) => {
    console.log('google called us back!');
  }
);

app.get('/auth/failure', (req, res) => res.send('failed to log in!'));

app.get('/auth/logout', (req, res) => {});

app.get('/secret', checkLoggedIn, (req, res) =>
  res.send('your password is 543!!!')
);

/**
 * listen port,
 * Basic way: using app.listen
 * run this to start the server: $ PORT=3001 npm start
 */
// const port = process.env.PORT;
// app.listen(port, () => console.log(`stay tuned on port ${port}!`));

/**
 * way 2: using HTTP createServer() (and import it)
 */
// http.createServer(app).listen(3001, () => console.log('using http connect'));

/**
 * way 3: using HTTPS with openssh to creating a self-signed certificate
 * when connecting to this server, chrome shows alert and just keep connecting manually.
 */
https
  .createServer(
    {
      key: fs.readFileSync('key.pem'),
      cert: fs.readFileSync('cert.pem'),
    },
    app
  )
  .listen(3001, () => console.log('https connecting is working on port 3001'));
