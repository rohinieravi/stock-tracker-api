exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                      'mongodb://localhost/stock-tracker';
exports.TEST_DATABASE_URL = (
	process.env.TEST_DATABASE_URL ||
	'mongodb://localhost/test-stock-tracker');
exports.PORT = process.env.PORT || 8080;
exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
exports.API_BASE_URL = 'https://sandbox.tradier.com/v1/markets';
exports.HEADERS = {
	Accept: 'application/json',
	Authorization: 'Bearer Ab4MdFXCigOZKOnAXImXMOsti9k1',
};