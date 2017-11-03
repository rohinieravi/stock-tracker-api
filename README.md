# Stock Tracker API

## Summary:
The Stock Tracker API serves as a backend server for the Stock Tracker app. 


## API Documentation:
The API for the Stock Tracker provides the following methods:
* GET /api/stocks/:username

Requires JWT token to be passed in header.

Success: Returns a JSON response containing the user's stock info.

Failure: Returns status code 500 with error message and log.

* GET /api/stocks/quotes/:symbol

Requires JWT token to be passed in header.

Success: Returns a JSON response containing the stock info and prices for the passed symbol.

Failure: Returns status code 500 with error message and log. 

* GET /api/stocks/search/:keyword

Requires JWT token to be passed in header.

Success: Returns a JSON response containing an array of companies that match the passed keyword.

Failure: Returns status code 500 with error message and log. 

* PUT /api/stocks/addcompany

Requires JWT token, username, stock symbol and units to be passed in header.

Success: If it is an existing stock, it updates the units for the stock and returns status code 204. If it is a new stock, it adds the stock to the existing stocks and returns  status code 200 along with the updated record.

Failure: Returns status code 500 with error message if the put failed.

* PUT /api/stocks/editUnits

Requires JWT token, username, stock symbol and units to be passed in header.

Success: It updates the units for the stock and returns status code 204. 

Failure: Returns status code 400 with error message when required field is missing.
		 Returns status code 500 with error message if the put failed.

* PUT /api/stocks/removecompany

Requires JWT token, username and stock symbol to be passed in header.

Success: It updates the stocks array for the user by removing the stock passed and returns status code 204. 

Failure: Returns status code 400 with error message when required field is missing.
		 Returns status code 500 with error message if the put failed.

* POST /api/auth/login

Requires username and password to be passed in header.

Success: It authenticates the user and returns the user info and status code 204 for a valid user. 

Failure: Returns status code 500 with error message if the post failed.

* POST /api/users/

Requires username, password and optionally user info to be passed in header.

Success: It cretaes a new user and returns the user info and status code 201. 

Failure: Returns status code 500 with error message if the post failed.
		 Returns status code 422 with error meassage for any validation errors.




## Technology Used:
* Node JS with Express
* Mocha, Chai and Chai HTTP
* Mongoose, MLAB

