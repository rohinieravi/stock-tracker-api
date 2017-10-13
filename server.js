const express = require('express');
const app = express();

//const PORT = process.env.PORT || 3000;

app.get('/api/*', (req, res) => {
res.json({ok: true});
});

//app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

let server;

function runServer() {
  const port = process.env.PORT || 8040;
  return new Promise((resolve, reject) => {
    server = app.listen(port, () => {
      console.log(`Your app is listening on port ${port}`);
      resolve(server);
    }).on('error', err => {
      reject(err)
    });
  });
}

function closeServer() {
  return new Promise((resolve, reject) => {
    console.log('Closing server');
    server.close(err => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};

