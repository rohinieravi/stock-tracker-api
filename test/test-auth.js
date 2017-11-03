const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const {app, runServer, closeServer} = require('../server');
const {Stock} = require('../models');
const {JWT_SECRET, TEST_DATABASE_URL} = require('../config');
const expect = chai.expect;


// This let's us make HTTP requests
// in our tests.
chai.use(chaiHttp);


describe('Auth endpoints', function() {
  const username = 'exampleUser';
  const password = 'examplePass';
  const user = {
   firstName: 'Example',
   lastName : 'User'
  };

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  after(function() {
    return closeServer();
  });

  beforeEach(function() {
    //creates dummy user
    return Stock.hashPassword(password).then(password =>
      Stock.create({
        username,
        password,
        user
      })
    );
  });

  afterEach(function() {
    //removes the dummy user
    return Stock.remove({});
  });

  describe('/api/auth/login', function() {
    it('Should reject requests with no credentials', function() {
      return chai.request(app)
        .post('/api/auth/login')
        .then(() => expect.fail(null, null, 'Request should not succeed'))
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    it('Should reject requests with incorrect usernames', function() {
      return chai.request(app)
        .post('/api/auth/login')
        .auth('wrongUsername', password)
        .then(() => expect.fail(null, null, 'Request should not succeed'))
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    it('Should reject requests with incorrect passwords', function() {
      return chai.request(app)
        .post('/api/auth/login')
        .auth(username, 'wrongPassword')
        .then(() => expect.fail(null, null, 'Request should not succeed'))
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    it('Should return a valid auth token', function() {
      return chai.request(app)
        .post('/api/auth/login')
        .auth(username, password)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          const token = res.body.authToken;
          expect(token).to.be.a('string');
          const payload = jwt.verify(token, JWT_SECRET, {
            algorithm:  ["HS256"]
          });
          expect(payload.user.username).to.deep.equal(username);
        })
    });
  });

  describe('/api/auth/refresh', function() {
    it('Should reject requests with no credentials', function() {
      return chai.request(app)
        .post('/api/auth/refresh')
        .then(() => expect.fail(null, null, 'Request should not succeed'))
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    it('Should reject requests with an invalid token', function() {
      const token = jwt.sign({
        username,
        user
      }, 'wrongSecret', {
        algorithm: 'HS256',
        expiresIn: '7d'
      });

      return chai.request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${token}`)
        .then(() => expect.fail(null, null, 'Request should not succeed'))
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    it('Should reject requests with an expired token', function() {
      const token = jwt.sign({
        user: {
          username,
          user
        },
        exp: Math.floor(Date.now() / 1000) - 10 // Expired ten seconds ago
      }, JWT_SECRET, {
        algorithm: 'HS256',
        subject: username
      });

      return chai.request(app)
        .post('/api/auth/refresh')
        .set('authorization', `Bearer ${token}`)
        .then(() => expect.fail(null, null, 'Request should not succeed'))
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    it('Should return a valid auth token with a newer expiry date', function() {
      const token = jwt.sign({
        user: {
          username,
          user
        },
      }, JWT_SECRET, {
        algorithm: 'HS256',
        subject: username,
        expiresIn: '7d'
      });
      const decoded = jwt.decode(token);

      return chai.request(app)
        .post('/api/auth/refresh')
        .set('authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          const token = res.body.authToken;
          expect(token).to.be.a('string');
          const payload = jwt.verify(token, JWT_SECRET, {
            algorithm:  ["HS256"]
          });
          expect(payload.user).to.deep.equal({
            username,
            user
          });
          expect(payload.exp).to.be.at.least(decoded.exp);
        });
    });
  });
});
