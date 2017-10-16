const mongoose = require('mongoose');

const stockSchema = mongoose.Schema({
  username: {type: String, required: true},
  password: {type: String, required: true},
  user:{
    firstName: {type:String},
    lastName: {type: String}
   },
  stocks: [{
    symbol: String,
    units: Number
  }]
});

stockSchema.virtual('name').get(function() {
  return `${this.user.firstName} ${this.user.lastName}`.trim();
});

stockSchema.methods.apiRepr = function() {
  return {
    username: this.username || '',
    name: this.name || '',
    stocks: this.stocks
  };
}

stockSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
}

stockSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
}


const Stock = mongoose.model('Stock', stockSchema);

module.exports = {Stock};