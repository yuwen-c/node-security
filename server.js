const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const passport = require('passport');
const cookieSession = require('cookie-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
// require('https').globalAgent.options.rejectUnauthorized = false;

require('dotenv').config();

const config = {
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  COOKIE_KEY_1: process.env.COOKIE_KEY_1,
  COOKIE_KEY_2: process.env.COOKIE_KEY_2,
};

const GOOGLE_AUTH_OPTIONS = {
  clientID: config.CLIENT_ID,
  clientSecret: config.CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
};

const verifyCallback = (accessToken, refreshToken, profile, done) => {
  console.log('profile', profile);
  done(null, profile);
};

passport.use(new GoogleStrategy(GOOGLE_AUTH_OPTIONS, verifyCallback));

// save user data to session, can only choose non-sensitive data
passport.serializeUser((user, done) => {
  done(null, user);
});

// read the session from the cookie
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

const app = express();

app.use(helmet());
app.use(
  cookieSession({
    name: 'session',
    maxAge: 24 * 60 * 60 * 1000,
    keys: [config.COOKIE_KEY_1, config.COOKIE_KEY_2],
  })
);
app.use(passport.initialize());
app.use(passport.session());

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
    session: true,
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
