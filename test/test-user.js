const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const {app, runServer, closeServer} = require('../server');
const {Stock} = require('../models');
const {JWT_SECRET, DATABASE_URL} = require('../config');

const expect = chai.expect;


// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);


describe('/api/user', function() {
  const username = 'exampleUser';
  const password = 'examplePass';
  const user = {
    firstName : 'Example',
    lastName : 'User'
  }
  
  const usernameB = 'exampleUserB';
  const passwordB = 'examplePassB';
  const userB = {
    firstNameB : 'ExampleB',
    lastNameB : 'UserB'
  };
  

  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  beforeEach(function() {
  });

  afterEach(function() {
    return Stock.remove({});
  });

  describe('/api/users', function() {
    describe('POST', function() {
      it('Should reject users with missing username', function() {
        return chai.request(app)
          .post('/api/users')
          .send({
            password,
            user
          })
          .then(() => expect.fail(null, null, 'Request should not succeed'))
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Missing field');
            expect(res.body.location).to.equal('username');
          });
      });
      it('Should reject users with missing password', function() {
        return chai.request(app)
          .post('/api/users')
          .send({
            username,
            user
          })
          .then(() => expect.fail(null, null, 'Request should not succeed'))
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Missing field');
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject users with non-string username', function() {
        return chai.request(app)
          .post('/api/users')
          .send({
            username: 1234,
            password,
            user
          })
          .then(() => expect.fail(null, null, 'Request should not succeed'))
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Incorrect field type: expected string');
            expect(res.body.location).to.equal('username');
          });
      });
      it('Should reject users with non-string password', function() {
        return chai.request(app)
          .post('/api/users')
          .send({
            username,
            password: 1234,
            user
          })
          .then(() => expect.fail(null, null, 'Request should not succeed'))
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Incorrect field type: expected string');
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject users with non-string first name', function() {
        return chai.request(app)
          .post('/api/users')
          .send({
            username,
            password,
            user: {
               firstName: 1234,
               lastName: user.lastName
             }
          })
          .then(() => expect.fail(null, null, 'Request should not succeed'))
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Incorrect field type: expected string');
            expect(res.body.location).to.equal('user');
          });
      });
      it('Should reject users with non-string last name', function() {
        return chai.request(app)
          .post('/api/users')
          .send({
            username,
            password,
            user: {
              firstName: user.firstName,
              lastName: 1234
            }
          })
          .then(() => expect.fail(null, null, 'Request should not succeed'))
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Incorrect field type: expected string');
            expect(res.body.location).to.equal('user');
          });
      });
      it('Should reject users with non-trimmed username', function() {
        return chai.request(app)
          .post('/api/users')
          .send({
            username: ` ${username} `,
            password,
            user
          })
          .then(() => expect.fail(null, null, 'Request should not succeed'))
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Cannot start or end with whitespace');
            expect(res.body.location).to.equal('username');
          });
      });
      it('Should reject users with non-trimmed password', function() {
        return chai.request(app)
          .post('/api/users')
          .send({
            username,
            password: ` ${password} `,
            user
          })
          .then(() => expect.fail(null, null, 'Request should not succeed'))
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Cannot start or end with whitespace');
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject users with empty username', function() {
        return chai.request(app)
          .post('/api/users')
          .send({
            username: '',
            password,
            user
          })
          .then(() => expect.fail(null, null, 'Request should not succeed'))
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Must be at least 1 characters long');
            expect(res.body.location).to.equal('username');
          });
      });
      it('Should reject users with password less than ten characters', function() {
        return chai.request(app)
          .post('/api/users')
          .send({
            username,
            password: '123456789',
            user
          })
          .then(() => expect.fail(null, null, 'Request should not succeed'))
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Must be at least 10 characters long');
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject users with password greater than 72 characters', function() {
        return chai.request(app)
          .post('/api/users')
          .send({
            username,
            password: new Array(73).fill('a').join(''),
            user
          })
          .then(() => expect.fail(null, null, 'Request should not succeed'))
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Must be at most 72 characters long');
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject users with duplicate username', function() {
        // Create an initial user
        return Stock.create({
          username,
          password,
          user
        })
        .then(() =>
          // Try to create a second user with the same username
          chai.request(app)
            .post('/api/users')
            .send({
              username,
              password,
              user
            })
        )
        .then(() => expect.fail(null, null, 'Request should not succeed'))
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal('Username already taken');
          expect(res.body.location).to.equal('username');
        });
      });
      it('Should create a new user', function() {
        return chai.request(app)
          .post('/api/users')
          .send({
            username,
            password,
            user
          })
          .then(res => {
            console.log(res.body);
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys('username', 'name', 'stocks');
            expect(res.body.username).to.equal(username);
            expect(res.body.name).to.contain(user.firstName);
            expect(res.body.name).to.contain(user.lastName);
            return Stock.findOne({
              username
            });
          })
          .then(item => {
            expect(item).to.not.be.null;
            expect(item.user.firstName).to.equal(user.firstName);
            expect(item.user.lastName).to.equal(user.lastName);
            return item.validatePassword(password);
          })
          .then(passwordIsCorrect => {
            expect(passwordIsCorrect).to.be.true;
          });
      });
      it('Should trim firstName and lastName', function() {
        return chai.request(app)
          .post('/api/users')
          .send({
            username,
            password,
            user: {
              firstName: ` ${user.firstName} `,
              lastName: ` ${user.lastName} `
            }
          })
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys('username', 'name', 'stocks');
            console.log(res.body);
            expect(res.body.username).to.equal(username);
            expect(res.body.name).to.contain(user.firstName);
            expect(res.body.name).to.contain(user.lastName);
            return Stock.findOne({
              username
            });
          })
          .then(item => {
            expect(item).to.not.be.null;
            expect(item.user.firstName).to.equal(user.firstName);
            expect(item.user.lastName).to.equal(user.lastName);
          })
      });
    });

             
  });
});
