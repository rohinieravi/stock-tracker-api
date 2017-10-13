const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const {Stock} = require('../models');
const faker = require('faker');
const {TEST_DATABASE_URL} = require('../config');

const {app, runServer, closeServer} = require('../server');

const should = chai.should();
chai.use(chaiHttp);


function seedStockData(){
	const seedData = [];
  	for (let i=1; i<=10; i++) {
    	seedData.push(generateStockData());
  	}
  	return Stock.insertMany(seedData);
}

function generateStockData() {
	return {
		username: faker.internet.email(),
		password: faker.name.firstName(),
		user: {
			firstName: faker.name.firstName(),
			lastName: faker.name.lastName(),
		},
		stocks: [{
			symbol: "AMZ",
			units: faker.random.number()
		},
		{
			symbol: "TSLA",
			units: faker.random.number()
		}]
	}
}

function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe('Stock Tracker API', function() {
 before(function() {
		return runServer(TEST_DATABASE_URL);
	});

	beforeEach(function() {
    return seedStockData();
  	});

  	afterEach(function() {
    return tearDownDb();
  	});

	after(function() {
		return closeServer();
	});

	describe('GET endpoint', function() {

		it('should return stock info for specified user', function() {
			let stockItem;
      		return Stock
	      	.findOne()
	      	.exec()
	      	.then(function(res){
	      		return chai.request(app)
	            .get(`/stocks/${res.username}`)
	        })
	        .then(function(res){
	        	res.should.have.status(200);
	          	res.should.be.json;
	          	res.body.should.be.a('array');
	          	res.body.should.have.lengthOf.at.least(1);
	          	res.body.forEach(function(item) {
	            	item.should.be.a('object');
	            	item.should.include.keys("username", "name", "stocks");
	        	});
	        	stockItem = res.body[0];
	        	return Stock.find({username: stockItem.username});
	        })
	        .then(function(res) {
	          stockItem.username.should.equal(res[0].username);
	          stockItem.name.should.contain(res[0].user.firstName);
	          stockItem.name.should.contain(res[0].user.lastName);
	          stockItem.stocks.length.should.equal(res[0].stocks.length);
	        });
		});

	});
	
});