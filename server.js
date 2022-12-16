const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
const helmet = require('helmet');

const app = express();
// 在app一開始就使用helmet middleware
app.use(helmet());

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

app.get('/auth/google', (req, res) => {});

// for google sends back the authorization code response
app.get('/auth/google/callback', (req, res) => {});

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
