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
			symbol: "AMZN",
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
	            .get(`/api/stocks/${res.username}`)
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

		it('should return quotes for a particular stock', function() {
			let symbol;
			return Stock
	      	.findOne()
	      	.exec()
	      	.then(function(res){
	      		symbol = res.stocks[0].symbol;
	      		return chai.request(app)
	            .get(`/api/stocks/quotes/${symbol}`)
	        })
	        .then(function(res){
	        	res.should.have.status(200);
	        	res.should.be.json;
	        	res.body.should.be.a('object');
	        	res.body.should.include.keys("quotes");
	        	res.body.quotes.should.include.keys("quote");
	        	res.body.quotes.quote.should.include.keys("symbol","description","last","change");
	        	res.body.quotes.quote.symbol.should.equal(symbol);
	        })
		});

		it('should return search results for a particular keyword', function() {
			let result;
			return Stock
	      	.findOne()
	      	.exec()
	      	.then(function(res){
	      		return chai.request(app)
	            .get(`/api/stocks/quotes/${res.stocks[0].symbol}`)
	        })
	        .then(function(res) {
	        	result = res.body.quotes.quote;
	        	return chai.request(app)
	        	.get(`/api/stocks/search/${result.description.substring(0,3)}`)
	        })
	        .then(function(res) {
	        	let isMatch = false;
	        	res.should.have.status(200);
	        	res.should.be.json;
	        	res.body.securities.security.should.be.a('array');
	        	res.body.securities.security.should.have.lengthOf.at.least(1);
	        	res.body.securities.security.forEach(function(item) {
	        		item.should.be.a('object');
	        		item.should.include.keys("symbol", "description");
	        		if(item.description === result.description) {
	        			isMatch = true;
	        		}
	        	});
	        	isMatch.should.equal(true);
	        })
		})

	});

	describe('PUT endpoint', function() {

		it('should add new company to stocks', function() {
			const updateData = {
				stock: {
					symbol: 'EBAY',
					units: 10
				}
			};
			return Stock
	      	.findOne()
	      	.exec()
	      	.then(function(res){
	      		//console.log(res.body);
	      		updateData.username = res.username;
	      		return chai.request(app)
	            .put('/api/stocks/addcompany')
	            .send(updateData);
	        })
	        .then(function(res){
	        	res.should.have.status(200);
		        res.should.be.json;
		        res.body.should.be.a('object');
		        const length = res.body.stocks.length - 1;
		        res.body.stocks[length].symbol.should.equal(updateData.stock.symbol);
		        res.body.stocks[length].units.should.equal(updateData.stock.units);
	        })
		});

		it('should update units for a particular stock', function() {
			const updateData = {
				units: 50
			};
			return Stock
	      	.findOne()
	      	.exec()
	      	.then(function(res){
	      		updateData.username = res.username;
	      		updateData.symbol = res.stocks[0].symbol;
	      		return chai.request(app)
	      		.put('/api/stocks/editUnits')
	      		.send(updateData)
	      	})
	      	.then(function(res) {
	      		res.should.have.status(204);
	      	})
		});
	});
	
});