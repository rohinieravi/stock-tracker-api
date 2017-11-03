const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const {CLIENT_ORIGIN, DATABASE_URL, PORT, API_BASE_URL, HEADERS} = require('./config');
const {Stock} = require('./models');
const request = require('request');
const userRouter = require('./userRouter');
const authRouter = require('./authRouter');
const {basicStrategy, jwtStrategy} = require('./strategies');
const passport = require('passport');


app.use(express.static('public'));
app.use(morgan('common'));
app.use(bodyParser.json());

mongoose.Promise = global.Promise;

//enables CORS
app.use(
    cors({
        origin: CLIENT_ORIGIN
    })
);

//uses passport for authentication
app.use(passport.initialize());
passport.use(basicStrategy);
passport.use(jwtStrategy);

app.use('/api/users/', userRouter);
app.use('/api/auth/', authRouter);

app.get('/api/stocks/:username', 
      passport.authenticate('jwt', {session: false}),
      (req, res) => {
  Stock
    .find({username: req.params.username})
    .exec()
    .then(items => {
      res.json(items.map(item =>item.apiRepr()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'something went terribly wrong'});
    });
});

app.get('/api/stocks/quotes/:symbol',
    passport.authenticate('jwt', {session: false}), 
    (req, res) => {
  if (!req.params.symbol) { 
    res.status(500); 
    res.send({"Error": "Missing symbol"}); 
  } 
  request.get({ 
      url: API_BASE_URL +'/quotes' ,
      qs: {
        symbols: req.params.symbol,
      },
      headers: HEADERS
     },  function(error, response, body) { 
          if (!error && response.statusCode == 200) { 
              res.set('Content-Type', 'application/json');
              res.send(body);
          } 
        }
  )
}); 

app.get('/api/stocks/search/:keyword',
     passport.authenticate('jwt', {session: false}),
     (req, res) => {
  if (!req.params.keyword) {
    res.status(500);
    res.send({"Error": "Missing keyword"});
  }
  request.get({
    url: API_BASE_URL + '/search',
    qs: {
      q: req.params.keyword
    },
    headers: HEADERS
  }, function(error, response, body) {
      if(!error && response.statusCode == 200) {
        res.set('Content-Type', 'application/json');
        res.send(body);
      }
  });
});

app.put('/api/stocks/addcompany',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
    console.log(req.body);
    const field = 'username';
    if (!(field in req.body)) {
      const message = `Missing ${field} in request body`
      console.error(message);
      return res.status(400).send(message);
    }
    Stock
      .findOne({username: req.body.username})
      .exec()
      .then(function(result){
          const isExisting = result.stocks.find(field => field.symbol === req.body.stock.symbol);
          if(isExisting) {
            Stock.update({'username': req.body.username,'stocks.symbol': req.body.stock.symbol}, 
              {$set: {'stocks.$.units': req.body.stock.units}})
            .exec()
            .then(stock => res.status(204).end())
            .catch(err => res.status(500).json({message: 'Internal server error'}));
          }
          else {
            Stock
              .findOneAndUpdate({username: req.body.username}, {$push:{stocks: req.body.stock}},{new: true})
              .exec()
              .then(stock => res.json(stock.apiRepr()))
              .catch(err => res.status(500).json({message: 'Internal server error'}));
          }

      })
});

app.put('/api/stocks/editUnits',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
  const requiredFields = ['username', 'symbol'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing ${field} in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  Stock.update({'username': req.body.username,'stocks.symbol': req.body.symbol}, 
    {$set: {'stocks.$.units': req.body.units}})
  .exec()
  .then(stock => res.status(204).end())
  .catch(err => res.status(500).json({message: 'Internal server error'}));
});

app.put('/api/stocks/removecompany',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
  const requiredFields = ['username', 'symbol'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing ${field} in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  Stock.update({'username': req.body.username}, 
    {$pull: {'stocks': { 'symbol': req.body.symbol }}})
  .exec()
  .then(stock => res.status(204).end())
  .catch(err => {
    console.log(err);
    return res.status(500).json({message: 'Internal server error'})
  });
});

app.use('*', (req, res) => {
  return res.status(404).json({message: 'Not Found'});
});

let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};
